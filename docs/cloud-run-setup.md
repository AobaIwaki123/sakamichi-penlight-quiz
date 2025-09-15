# Cloud Run 自動デプロイメント セットアップガイド

## 概要

このガイドでは、坂道ペンライトクイズアプリケーションをGoogle Cloud Runでブランチごとに自動デプロイする環境を構築する方法を説明します。

## 🎯 実現される機能

- **ブランチごとの自動デプロイ**: `main`, `develop`, `feature/*`, `fix/*` ブランチへのプッシュで自動デプロイ
- **PR プレビュー環境**: プルリクエスト作成時にプレビュー環境を自動作成
- **自動クリーンアップ**: PR クローズ時にプレビュー環境を自動削除
- **環境別リソース最適化**: 本番・開発・プレビューで異なるリソース配分
- **セキュアなシークレット管理**: Google Secret Manager を使用

## 📋 前提条件

- Google Cloud Platform アカウント
- GitHub リポジトリへの管理者権限
- gcloud CLI のインストール（ローカル設定用）
- Docker のインストール（ローカルテスト用）

## 🚀 セットアップ手順

### Step 1: Google Cloud Project の準備

#### 1.1 プロジェクトの作成・選択
```bash
# 新しいプロジェクトを作成（既存の場合はスキップ）
gcloud projects create your-project-id --name="Sakamichi Penlight Quiz"

# プロジェクトを選択
gcloud config set project your-project-id

# 課金アカウントの関連付け（必要に応じて）
gcloud billing projects link your-project-id --billing-account=YOUR_BILLING_ACCOUNT_ID
```

#### 1.2 必要な API の有効化
```bash
# 必要な Google Cloud API を有効化
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  bigquery.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com
```

### Step 2: Artifact Registry の設定

#### 2.1 Docker リポジトリの作成
```bash
# Artifact Registry リポジトリの作成
gcloud artifacts repositories create penlight \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="坂道ペンライトクイズアプリ用Dockerイメージリポジトリ"
```

#### 2.2 認証設定
```bash
# Docker 認証の設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev
```

### Step 3: サービスアカウントの作成と権限設定

#### 3.1 Cloud Run 実行用サービスアカウント
```bash
# Cloud Run サービス実行用のサービスアカウント作成
gcloud iam service-accounts create cloud-run-penlight \
  --display-name="Cloud Run Penlight Service Account" \
  --description="坂道ペンライトクイズアプリ用のCloud Runサービスアカウント"

# BigQuery 読み取り権限
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"

# ログ書き込み権限
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"

# Secret Manager 読み取り権限
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 3.2 GitHub Actions デプロイ用サービスアカウント
```bash
# GitHub Actions デプロイ用サービスアカウント作成
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deploy Service Account" \
  --description="GitHub ActionsからCloud Runデプロイ用"

# Cloud Run 管理権限
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:github-actions-deploy@your-project-id.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Artifact Registry 書き込み権限
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:github-actions-deploy@your-project-id.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# サービスアカウント使用権限
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:github-actions-deploy@your-project-id.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Secret Manager 管理権限
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:github-actions-deploy@your-project-id.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"
```

#### 3.3 サービスアカウントキーの作成
```bash
# GitHub Actions 用のキーファイル作成
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account="github-actions-deploy@your-project-id.iam.gserviceaccount.com"

# Cloud Run 実行用のキーファイル作成（Secret Manager 用）
gcloud iam service-accounts keys create cloud-run-sa-key.json \
  --iam-account="cloud-run-penlight@your-project-id.iam.gserviceaccount.com"
```

### Step 4: Secret Manager の設定

#### 4.1 BigQuery 認証情報の保存
```bash
# BigQuery 用のシークレット作成
gcloud secrets create bigquery-sa-key \
  --replication-policy="automatic"

# サービスアカウントキーをシークレットに保存
gcloud secrets versions add bigquery-sa-key \
  --data-file="cloud-run-sa-key.json"

# Cloud Run サービスアカウントに読み取り権限を付与
gcloud secrets add-iam-policy-binding bigquery-sa-key \
  --member="serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 5: GitHub Secrets の設定

GitHub リポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定：

#### 5.1 必須シークレット
```bash
# GCP プロジェクト ID
GCP_PROJECT_ID="your-project-id"

# GitHub Actions デプロイ用サービスアカウントキー（JSON全体）
GCP_SA_KEY="$(cat github-actions-key.json)"

# Cloud Run サービス実行用サービスアカウントのメールアドレス
CLOUD_RUN_SA_EMAIL="cloud-run-penlight@your-project-id.iam.gserviceaccount.com"
```

#### 5.2 GitHub Secrets 設定手順
1. GitHub リポジトリページで **Settings** タブをクリック
2. 左サイドバーで **Secrets and variables** > **Actions** をクリック
3. **New repository secret** をクリック
4. 以下の情報を入力：

| Name | Value | 説明 |
|------|-------|------|
| `GCP_PROJECT_ID` | `your-project-id` | Google Cloud プロジェクトID |
| `GCP_SA_KEY` | `github-actions-key.json`の内容 | GitHub Actions用サービスアカウントキー（JSON全体） |
| `CLOUD_RUN_SA_EMAIL` | `cloud-run-penlight@your-project-id.iam.gserviceaccount.com` | Cloud Run実行用サービスアカウント |

### Step 6: BigQuery データセットとテーブルの確認

#### 6.1 既存のBigQueryリソース確認
```bash
# データセットの確認
gcloud bigquery datasets describe sakamichipenlightquiz:sakamichi

# テーブルの確認
gcloud bigquery tables describe \
  sakamichipenlightquiz:sakamichi.hinatazaka_member_master
```

#### 6.2 権限確認
```bash
# Cloud Run サービスアカウントの BigQuery 権限確認
gcloud projects get-iam-policy your-project-id \
  --filter="bindings.members:serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com"
```

### Step 7: GitHub Actions ワークフローの有効化

#### 7.1 ワークフローファイルの確認
以下のファイルがリポジトリに存在することを確認：
- `.github/workflows/cloud-run-deploy.yml`

#### 7.2 最初のデプロイテスト
```bash
# develop ブランチでテストコミット
git checkout develop
git commit --allow-empty -m "test: Cloud Run デプロイテスト"
git push origin develop
```

## 🔧 カスタマイズ設定

### 環境別リソース設定

#### 本番環境 (main ブランチ)
- **CPU**: 2 vCPU
- **Memory**: 2GB
- **Max Instances**: 10
- **Min Instances**: 1
- **Concurrency**: 100

#### 開発環境 (develop ブランチ)
- **CPU**: 1 vCPU
- **Memory**: 1GB
- **Max Instances**: 5
- **Min Instances**: 0
- **Concurrency**: 50

#### プレビュー環境 (PR・feature ブランチ)
- **CPU**: 1 vCPU
- **Memory**: 512MB
- **Max Instances**: 2
- **Min Instances**: 0
- **Concurrency**: 20

### サービス名の命名規則

| 環境 | ブランチ | サービス名 | 例 |
|------|---------|-----------|-----|
| 本番 | `main` | `penlight-prod` | `penlight-prod` |
| 開発 | `develop` | `penlight-dev` | `penlight-dev` |
| プレビュー | PR | `penlight-pr-{番号}` | `penlight-pr-123` |
| フィーチャー | `feature/*` | `penlight-{ブランチ名}` | `penlight-member-filter` |

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. デプロイが失敗する
```bash
# ログの確認
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=penlight-dev" \
  --limit=50 --format="table(timestamp,severity,textPayload)"

# サービスの状態確認
gcloud run services describe penlight-dev --region=asia-northeast1
```

#### 2. BigQuery 接続エラー
```bash
# サービスアカウントの権限確認
gcloud projects get-iam-policy your-project-id \
  --filter="bindings.members:serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com"

# Secret Manager の確認
gcloud secrets versions list bigquery-sa-key
```

#### 3. GitHub Actions が失敗する
- **GCP_SA_KEY** が正しく設定されているか確認
- サービスアカウントに必要な権限があるか確認
- プロジェクト ID が正しいか確認

#### 4. メモリ不足エラー
```bash
# メモリ使用量の確認
gcloud run services update penlight-dev \
  --region=asia-northeast1 \
  --memory=1Gi
```

### ログの確認方法

#### Cloud Run サービスログ
```bash
# リアルタイムログの確認
gcloud logs tail "resource.type=cloud_run_revision" --follow

# 特定のサービスのログ
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=penlight-prod" \
  --limit=100 --format="table(timestamp,severity,textPayload)"
```

#### GitHub Actions ログ
1. GitHub リポジトリの **Actions** タブを開く
2. 該当するワークフロー実行をクリック
3. 各ジョブの詳細ログを確認

## 📊 監視とメトリクス

### Cloud Monitoring の設定

#### 1. アラートポリシーの作成
```bash
# CPU 使用率のアラート作成例
gcloud alpha monitoring policies create \
  --policy-from-file=monitoring-policy.yaml
```

#### 2. ダッシュボードの作成
Google Cloud Console > Monitoring > Dashboards で以下のメトリクスを監視：

- **Cloud Run メトリクス**:
  - Request count
  - Request latency
  - CPU utilization
  - Memory utilization
  - Instance count

- **BigQuery メトリクス**:
  - Query count
  - Query duration
  - Bytes processed

### ヘルスチェックエンドポイント

以下のエンドポイントが自動的に作成されます：

- **`/health`**: 基本的なヘルスチェック
- **`/ready`**: レディネスチェック（詳細な状態確認）

## 🔒 セキュリティ考慮事項

### 1. 最小権限の原則
- 各サービスアカウントには必要最小限の権限のみ付与
- 定期的な権限の見直し

### 2. シークレット管理
- サービスアカウントキーは Secret Manager で管理
- GitHub Secrets は暗号化されて保存

### 3. ネットワークセキュリティ
- Cloud Run サービスは HTTPS のみ許可
- 必要に応じて VPC Connector を使用

### 4. 監査ログ
```bash
# Cloud Audit Logs の有効化確認
gcloud logging sinks list
```

## 💰 コスト最適化

### 1. リソース設定の最適化
- プレビュー環境は最小リソースで設定
- 自動スケーリングで不要なインスタンスを削除

### 2. 自動クリーンアップ
- PR クローズ時の自動リソース削除
- 古いイメージの定期削除

### 3. BigQuery コスト管理
- 開発・プレビュー環境ではモックデータを使用
- クエリの最適化

## 📚 参考リンク

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)

## 🆘 サポート

問題が発生した場合は、以下の情報を含めてイシューを作成してください：

1. エラーメッセージの詳細
2. 実行したコマンドとその結果
3. 環境情報（ブランチ、プロジェクトID など）
4. Cloud Run サービスのログ

---

**最終更新日**: 2025-09-15  
**バージョン**: 1.0.0