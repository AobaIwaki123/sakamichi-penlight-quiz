# GitHub Secrets セットアップガイド

## 概要

Cloud Run 自動デプロイメントに必要な GitHub Secrets の設定手順を詳しく説明します。

## 🔑 必要なシークレット一覧

| シークレット名 | 説明 | 取得方法 |
|---------------|------|----------|
| `GCP_PROJECT_ID` | Google Cloud プロジェクト ID | Google Cloud Console で確認 |
| `GCP_SA_KEY` | GitHub Actions用サービスアカウントキー | gcloud CLI で生成 |
| `CLOUD_RUN_SA_EMAIL` | Cloud Run実行用サービスアカウントのメールアドレス | サービスアカウント作成時に生成 |

## 📋 事前準備

### 1. Google Cloud CLI のインストール
```bash
# macOS (Homebrew)
brew install google-cloud-sdk

# Ubuntu/Debian
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get update && sudo apt-get install google-cloud-sdk

# Windows (PowerShell)
# Google Cloud SDK インストーラーをダウンロードして実行
```

### 2. Google Cloud 認証
```bash
# Google Cloud にログイン
gcloud auth login

# プロジェクトの設定
gcloud config set project your-project-id

# 現在の設定確認
gcloud config list
```

## 🛠️ サービスアカウントの作成と設定

### Step 1: GitHub Actions 用サービスアカウントの作成

```bash
# プロジェクト ID を環境変数に設定
export PROJECT_ID="your-project-id"

# GitHub Actions デプロイ用サービスアカウント作成
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deploy Service Account" \
  --description="GitHub ActionsからCloud Runデプロイ用" \
  --project="$PROJECT_ID"
```

### Step 2: 必要な権限の付与

```bash
# Cloud Run 管理権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Artifact Registry 書き込み権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# サービスアカウント使用権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Secret Manager 管理権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

# ログ書き込み権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"
```

### Step 3: Cloud Run 実行用サービスアカウントの作成

```bash
# Cloud Run サービス実行用のサービスアカウント作成
gcloud iam service-accounts create cloud-run-penlight \
  --display-name="Cloud Run Penlight Service Account" \
  --description="坂道ペンライトクイズアプリ用のCloud Runサービスアカウント" \
  --project="$PROJECT_ID"

# BigQuery 読み取り権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"

# ログ書き込み権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"

# Secret Manager 読み取り権限
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 4: サービスアカウントキーの生成

```bash
# GitHub Actions 用のキーファイル作成
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account="github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="$PROJECT_ID"

# Cloud Run 実行用のキーファイル作成（Secret Manager 用）
gcloud iam service-accounts keys create cloud-run-sa-key.json \
  --iam-account="cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="$PROJECT_ID"

echo "✅ サービスアカウントキーが作成されました"
echo "📁 github-actions-key.json"
echo "📁 cloud-run-sa-key.json"
```

## 🔐 Secret Manager の設定

### BigQuery 認証情報の保存

```bash
# BigQuery 用のシークレット作成
gcloud secrets create bigquery-sa-key \
  --replication-policy="automatic" \
  --project="$PROJECT_ID"

# サービスアカウントキーをシークレットに保存
gcloud secrets versions add bigquery-sa-key \
  --data-file="cloud-run-sa-key.json" \
  --project="$PROJECT_ID"

# Cloud Run サービスアカウントに読み取り権限を付与
gcloud secrets add-iam-policy-binding bigquery-sa-key \
  --member="serviceAccount:cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project="$PROJECT_ID"

echo "✅ Secret Manager にBigQuery認証情報を保存しました"
```

## 🔧 GitHub Secrets の設定

### Step 1: GitHub リポジトリでの設定

1. **GitHub リポジトリにアクセス**
   - ブラウザで GitHub リポジトリを開く
   - 右上の **Settings** タブをクリック

2. **Secrets and variables の設定**
   - 左サイドバーで **Secrets and variables** をクリック
   - **Actions** をクリック

### Step 2: 各シークレットの追加

#### 2.1 GCP_PROJECT_ID の設定

1. **New repository secret** をクリック
2. 以下を入力：
   - **Name**: `GCP_PROJECT_ID`
   - **Secret**: `your-project-id`（実際のプロジェクトIDに置き換え）
3. **Add secret** をクリック

#### 2.2 GCP_SA_KEY の設定

```bash
# キーファイルの内容をクリップボードにコピー（macOS）
cat github-actions-key.json | pbcopy

# キーファイルの内容をクリップボードにコピー（Linux）
cat github-actions-key.json | xclip -selection clipboard

# キーファイルの内容を表示（Windows）
type github-actions-key.json
```

1. **New repository secret** をクリック
2. 以下を入力：
   - **Name**: `GCP_SA_KEY`
   - **Secret**: `github-actions-key.json` の内容全体（JSON形式のまま）
3. **Add secret** をクリック

#### 2.3 CLOUD_RUN_SA_EMAIL の設定

```bash
# サービスアカウントのメールアドレスを確認
echo "cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com"
```

1. **New repository secret** をクリック
2. 以下を入力：
   - **Name**: `CLOUD_RUN_SA_EMAIL`
   - **Secret**: `cloud-run-penlight@your-project-id.iam.gserviceaccount.com`
3. **Add secret** をクリック

### Step 3: 設定の確認

設定完了後、以下のシークレットが表示されることを確認：

```
Repository secrets
├── GCP_PROJECT_ID          (Updated X minutes ago)
├── GCP_SA_KEY              (Updated X minutes ago)
└── CLOUD_RUN_SA_EMAIL      (Updated X minutes ago)
```

## ✅ 設定の検証

### 1. GitHub Actions の動作確認

```bash
# テスト用の空コミットをプッシュ
git checkout develop
git commit --allow-empty -m "test: GitHub Actions 設定テスト"
git push origin develop
```

### 2. ログの確認

1. GitHub リポジトリの **Actions** タブを開く
2. 最新のワークフロー実行をクリック
3. 各ジョブのログを確認

### 3. Cloud Run サービスの確認

```bash
# デプロイされたサービスの一覧確認
gcloud run services list --region=asia-northeast1

# 特定のサービスの詳細確認
gcloud run services describe penlight-dev --region=asia-northeast1
```

## 🔄 シークレットの更新

### サービスアカウントキーの更新

```bash
# 古いキーの削除（セキュリティのため）
gcloud iam service-accounts keys list \
  --iam-account="github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# 古いキーIDを指定して削除
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account="github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# 新しいキーの作成
gcloud iam service-accounts keys create github-actions-key-new.json \
  --iam-account="github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
```

### GitHub Secrets の更新

1. GitHub リポジトリの **Settings** > **Secrets and variables** > **Actions**
2. 更新したいシークレット名をクリック
3. **Update secret** をクリック
4. 新しい値を入力して **Update secret**

## 🚨 トラブルシューティング

### よくあるエラーと解決方法

#### 1. 認証エラー
```
Error: google-github-actions/auth failed with: failed to generate access token
```

**解決方法**:
- `GCP_SA_KEY` の JSON 形式が正しいか確認
- サービスアカウントが存在するか確認
- 必要な権限が付与されているか確認

#### 2. 権限不足エラー
```
Error: Permission denied on resource project
```

**解決方法**:
```bash
# サービスアカウントの権限を確認
gcloud projects get-iam-policy "$PROJECT_ID" \
  --filter="bindings.members:serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# 不足している権限を追加
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/MISSING_ROLE"
```

#### 3. Secret Manager エラー
```
Error: Secret not found
```

**解決方法**:
```bash
# シークレットの存在確認
gcloud secrets list --project="$PROJECT_ID"

# シークレットの再作成
gcloud secrets create bigquery-sa-key \
  --replication-policy="automatic" \
  --project="$PROJECT_ID"
```

### デバッグ用コマンド

```bash
# サービスアカウントの一覧確認
gcloud iam service-accounts list --project="$PROJECT_ID"

# 特定のサービスアカウントの詳細確認
gcloud iam service-accounts describe \
  "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# プロジェクトのIAMポリシー確認
gcloud projects get-iam-policy "$PROJECT_ID"

# Secret Manager のシークレット一覧
gcloud secrets list --project="$PROJECT_ID"
```

## 🔒 セキュリティのベストプラクティス

### 1. 定期的なキーローテーション
- サービスアカウントキーを3ヶ月ごとに更新
- 古いキーは削除してセキュリティリスクを軽減

### 2. 最小権限の原則
- 必要最小限の権限のみ付与
- 定期的な権限の見直し

### 3. 監査ログの確認
```bash
# Cloud Audit Logs の確認
gcloud logging read "protoPayload.serviceName=iam.googleapis.com" \
  --limit=10 --format="table(timestamp,protoPayload.methodName,protoPayload.authenticationInfo.principalEmail)"
```

### 4. アラートの設定
```bash
# 異常なアクティビティのアラート設定
gcloud alpha monitoring policies create \
  --policy-from-file=security-alert-policy.yaml
```

## 📞 サポート

問題が発生した場合は、以下の情報を含めてイシューを作成してください：

1. **エラーメッセージの詳細**
2. **実行したコマンドとその結果**
3. **環境情報**:
   - Google Cloud プロジェクトID
   - 使用しているブランチ
   - GitHub Actions の実行ログ
4. **設定したシークレットの一覧**（値は含めない）

---

**最終更新日**: 2025-09-15  
**バージョン**: 1.0.0