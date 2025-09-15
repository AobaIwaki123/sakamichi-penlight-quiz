# Cloud Run 自動デプロイメント - 坂道ペンライトクイズ

## 🎯 概要

この設定により、坂道ペンライトクイズアプリケーションを Google Cloud Run でブランチごとに自動デプロイする環境が構築されます。

## ✨ 主な機能

- **ブランチごとの自動デプロイ**: `main`, `develop`, `feature/*`, `fix/*` ブランチへのプッシュで自動デプロイ
- **PR プレビュー環境**: プルリクエスト作成時にプレビュー環境を自動作成・削除
- **環境別リソース最適化**: 本番・開発・プレビューで異なるリソース配分
- **セキュアなシークレット管理**: Google Secret Manager を使用
- **自動クリーンアップ**: 不要なリソースの自動削除
- **包括的な監視**: Cloud Monitoring による詳細な監視

## 🏗️ アーキテクチャ

```
GitHub Repository
├── main branch          → penlight-prod (本番環境)
├── develop branch       → penlight-dev (開発環境)
├── feature/* branches   → penlight-{branch-name} (フィーチャー環境)
└── Pull Requests        → penlight-pr-{number} (プレビュー環境)
                            ↓
                     GitHub Actions
                            ↓
                    Google Cloud Run
                            ↓
                      BigQuery (データ取得)
```

## 🚀 クイックスタート

### 1. 自動セットアップ（推奨）

```bash
# セットアップスクリプトを実行
./scripts/setup-cloud-run.sh your-project-id

# GitHub Secrets の設定（スクリプト出力の指示に従う）
# - GCP_PROJECT_ID
# - GCP_SA_KEY  
# - CLOUD_RUN_SA_EMAIL
```

### 2. テストデプロイ

```bash
# develop ブランチでテスト
git checkout develop
git commit --allow-empty -m "test: Cloud Run デプロイテスト"
git push origin develop
```

### 3. 動作確認

- GitHub Actions の実行ログを確認
- Cloud Run コンソールでサービスの状態を確認
- デプロイされたアプリケーションにアクセス

## 📁 ファイル構成

### 新規追加ファイル

```
.github/workflows/
└── cloud-run-deploy.yml          # メインのデプロイワークフロー

cloud-run/
├── service-account.yml            # サービスアカウント設定例
├── service-template.yml           # Cloud Run サービステンプレート
└── Dockerfile.cloudrun            # Cloud Run 最適化版 Dockerfile

view/
├── next.config.cloudrun.mjs       # Cloud Run 向け Next.js 設定
└── api/
    ├── health.ts                  # ヘルスチェックエンドポイント
    └── ready.ts                   # レディネスチェックエンドポイント

docs/
├── cloud-run-setup.md             # 詳細セットアップガイド
├── github-secrets-setup.md        # GitHub Secrets 設定ガイド
└── cloud-run-migration-guide.md   # Kubernetes からの移行ガイド

scripts/
└── setup-cloud-run.sh             # 自動セットアップスクリプト
```

## 🔧 環境別設定

| 環境 | ブランチ | サービス名 | CPU | Memory | インスタンス |
|------|---------|-----------|-----|---------|-------------|
| 本番 | `main` | `penlight-prod` | 2 vCPU | 2GB | 1-10 |
| 開発 | `develop` | `penlight-dev` | 1 vCPU | 1GB | 0-5 |
| プレビュー | PR | `penlight-pr-{number}` | 1 vCPU | 512MB | 0-2 |
| フィーチャー | `feature/*` | `penlight-{branch}` | 1 vCPU | 512MB | 0-2 |

## 🔐 セキュリティ

### サービスアカウント権限

#### Cloud Run 実行用
- `roles/bigquery.dataViewer` - BigQuery データ読み取り
- `roles/bigquery.jobUser` - BigQuery ジョブ実行
- `roles/logging.logWriter` - ログ書き込み
- `roles/secretmanager.secretAccessor` - シークレット読み取り

#### GitHub Actions デプロイ用
- `roles/run.admin` - Cloud Run 管理
- `roles/artifactregistry.writer` - イメージプッシュ
- `roles/iam.serviceAccountUser` - サービスアカウント使用
- `roles/secretmanager.admin` - シークレット管理

### シークレット管理
- BigQuery 認証情報は Google Secret Manager で管理
- GitHub Secrets で GitHub Actions 認証情報を管理
- 最小権限の原則に基づく権限設定

## 📊 監視・運用

### ヘルスチェック
- **`/health`**: 基本的なアプリケーション状態
- **`/ready`**: 詳細なレディネスチェック

### ログ監視
```bash
# Cloud Run サービスのログ確認
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=penlight-prod" \
  --limit=50 --format="table(timestamp,severity,textPayload)"

# エラーログのフィルタリング
gcloud logs read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=20
```

### メトリクス
- リクエスト数・レスポンス時間
- CPU・メモリ使用率
- エラー率・可用性
- BigQuery クエリ実行時間

## 🔄 デプロイフロー

### 通常のデプロイ

1. **コードプッシュ** → GitHub
2. **GitHub Actions 実行** → Docker ビルド・プッシュ
3. **Cloud Run デプロイ** → 新しいリビジョン作成
4. **トラフィック切り替え** → 100% 新リビジョンへ
5. **ヘルスチェック** → 正常性確認

### プレビュー環境

1. **PR 作成** → 自動でプレビュー環境作成
2. **PR コメント** → デプロイ完了通知・URL表示
3. **PR 更新** → プレビュー環境も自動更新
4. **PR クローズ** → プレビュー環境自動削除

## 💰 コスト最適化

### リソース最適化
- **オートスケーリング**: 0 → N、N → 0 の自動スケーリング
- **環境別リソース**: プレビュー環境は最小構成
- **自動クリーンアップ**: 不要なリソースの定期削除

### BigQuery コスト
- 開発・プレビュー環境ではモックデータを使用
- 本番環境でもクエリ最適化によりコスト削減

### 想定コスト（月額）
- **本番環境**: $20-50（トラフィックに応じて）
- **開発環境**: $5-15（使用頻度に応じて）
- **プレビュー環境**: $1-5（PR 数に応じて）

## 🛠️ トラブルシューティング

### よくある問題

#### デプロイ失敗
```bash
# GitHub Actions ログの確認
# → GitHub リポジトリの Actions タブ

# Cloud Run サービスの状態確認
gcloud run services describe penlight-dev --region=asia-northeast1
```

#### BigQuery 接続エラー
```bash
# サービスアカウント権限の確認
gcloud projects get-iam-policy your-project-id \
  --filter="bindings.members:serviceAccount:cloud-run-penlight@your-project-id.iam.gserviceaccount.com"

# Secret Manager の確認
gcloud secrets versions list bigquery-sa-key
```

#### メモリ不足
```bash
# メモリ制限の増加
gcloud run services update penlight-prod \
  --region=asia-northeast1 \
  --memory=2Gi
```

### サポート

問題が発生した場合は、以下の情報を含めて Issue を作成してください：

1. エラーメッセージの詳細
2. 実行したコマンドとその結果  
3. 環境情報（ブランチ、プロジェクトID など）
4. GitHub Actions の実行ログ
5. Cloud Run サービスのログ

## 📚 詳細ドキュメント

- **[詳細セットアップガイド](docs/cloud-run-setup.md)** - 手動セットアップの詳細手順
- **[GitHub Secrets 設定](docs/github-secrets-setup.md)** - シークレット設定の詳細
- **[Kubernetes からの移行](docs/cloud-run-migration-guide.md)** - 既存環境からの移行手順

## 🔧 カスタマイズ

### リソース調整
`.github/workflows/cloud-run-deploy.yml` の以下の部分を編集：

```yaml
# 本番環境の設定例
"production")
  MAX_INSTANCES=10
  MIN_INSTANCES=1
  CPU_LIMIT="2"
  MEMORY_LIMIT="2Gi"
  CONCURRENCY=100
  ;;
```

### 環境変数の追加
```yaml
--set-env-vars="NODE_ENV=production,CUSTOM_VAR=value"
```

### 新しいブランチパターンの追加
```yaml
on:
  push:
    branches:
      - main
      - develop
      - "feature/**"
      - "hotfix/**"    # 追加例
```

## 🔄 更新履歴

- **v1.0.0** (2025-09-15): 初期バージョン
  - Cloud Run 自動デプロイメント機能
  - ブランチごとの環境作成
  - PR プレビュー環境
  - 包括的なドキュメント

## 📞 連絡先

- **技術的な質問**: GitHub Issues
- **緊急時**: [担当者連絡先]
- **Google Cloud サポート**: [サポートケース]

---

**最終更新**: 2025-09-15  
**バージョン**: 1.0.0