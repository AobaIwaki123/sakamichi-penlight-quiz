# ブランチプレビュー機能セットアップガイド

このガイドでは、Cloud Runを使用したブランチごとのプレビュー環境機能のセットアップ方法を説明します。

## 前提条件

### 1. Google Cloud Platform
- GCPプロジェクトが作成済み
- 課金アカウントが有効
- Cloud Run API が有効化済み
- Container Registry API が有効化済み

### 2. 権限
- リポジトリの管理者権限
- GCPプロジェクトの編集権限

## セットアップ手順

### 1. Google Cloud サービスアカウント作成

#### サービスアカウント作成
```bash
# GCPプロジェクトIDを設定
export PROJECT_ID="your-gcp-project-id"

# サービスアカウントを作成
gcloud iam service-accounts create github-actions-preview \
    --display-name="GitHub Actions Preview Environment" \
    --description="ブランチプレビュー環境用サービスアカウント"
```

#### 必要な権限を付与
```bash
# Cloud Run管理権限
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# Container Registry管理権限
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# サービスアカウントユーザー権限
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

#### サービスアカウントキーを作成
```bash
# キーファイルを作成
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com

# キーファイルの内容を確認（後でGitHub Secretsに設定）
cat github-actions-key.json
```

### 2. GitHub Secrets設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下のシークレットを追加：

#### 新規追加するシークレット
```bash
# GCPプロジェクトID
GCP_PROJECT_ID
値: your-gcp-project-id

# サービスアカウントキー（JSONファイル全体の内容）
GCP_SA_KEY
値: {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions-preview@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

#### 既存のシークレット（確認）
```bash
# ArgoCD用（既存）
ARGOCD_TOKEN
値: your-argocd-token
```

### 3. Cloud Run API の有効化

```bash
# 必要なAPIを有効化
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 4. 動作確認

#### テスト用ブランチでの確認
```bash
# 1. テスト用ブランチを作成
git checkout -b feature/test-preview-environment

# 2. 軽微な変更を加える
echo "# テスト" >> view/README.md

# 3. コミット・プッシュ
git add .
git commit -m "test: プレビュー環境のテスト"
git push origin feature/test-preview-environment

# 4. GitHub Actions の実行を確認
# リポジトリの「Actions」タブで「Branch Preview Environment」ワークフローを確認
```

#### プルリクエストでの確認
```bash
# 1. GitHub でプルリクエストを作成
# 2. 自動的にプレビュー環境が作成される
# 3. PRコメントにプレビューURLが投稿される
# 4. URLにアクセスして動作確認
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. "Permission denied" エラー
**原因**: サービスアカウントの権限不足

**解決方法**:
```bash
# 権限を再確認
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com"

# 不足している権限があれば追加
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin"
```

#### 2. "API not enabled" エラー
**原因**: 必要なGCP APIが有効化されていない

**解決方法**:
```bash
# APIの状態を確認
gcloud services list --enabled --filter="name:run.googleapis.com"
gcloud services list --enabled --filter="name:containerregistry.googleapis.com"

# APIを有効化
gcloud services enable run.googleapis.com containerregistry.googleapis.com
```

#### 3. "Quota exceeded" エラー
**原因**: GCPのクォータ制限に達している

**解決方法**:
1. [GCPコンソール](https://console.cloud.google.com/iam-admin/quotas)でクォータを確認
2. 必要に応じてクォータ増加を申請
3. 不要なCloud Runサービスを削除

#### 4. Docker build が失敗する
**原因**: Dockerfileの問題またはビルドコンテキストの問題

**解決方法**:
```bash
# ローカルでビルドテスト
cd view/
docker build --target prod -t test-image .

# エラーがある場合はDockerfileを修正
```

### ログの確認方法

#### GitHub Actions ログ
1. リポジトリの「Actions」タブを開く
2. 失敗したワークフローをクリック
3. 赤いステップをクリックしてエラー詳細を確認

#### Cloud Run ログ
```bash
# 特定サービスのログを確認
gcloud logs read --limit=50 \
    --filter="resource.type=cloud_run_revision AND resource.labels.service_name=penlight-pr-123"

# リアルタイムログの監視
gcloud logs tail --filter="resource.type=cloud_run_revision AND resource.labels.service_name=penlight-pr-123"
```

## 運用・監視

### コスト管理

#### 現在のプレビューサービス確認
```bash
# プレビュー環境一覧
gcloud run services list \
    --region=asia-northeast1 \
    --filter="metadata.labels.type=preview" \
    --format="table(metadata.name,spec.template.spec.containers[0].image,metadata.creationTimestamp)"
```

#### 不要なサービスの一括削除
```bash
# 30日以上古いプレビューサービスを削除
CUTOFF_DATE=$(date -d '30 days ago' -u +%Y-%m-%dT%H:%M:%S)

gcloud run services list \
    --region=asia-northeast1 \
    --filter="metadata.labels.type=preview AND metadata.creationTimestamp < '${CUTOFF_DATE}'" \
    --format="value(metadata.name)" | \
    xargs -I {} gcloud run services delete {} \
        --region=asia-northeast1 \
        --quiet
```

### 監視設定

#### Cloud Monitoring アラート
```bash
# プレビュー環境のリソース使用量監視
# GCPコンソール > Monitoring > Alerting で設定
```

#### 定期メンテナンス
```bash
# 週次実行推奨
#!/bin/bash
# cleanup-preview-environments.sh

echo "=== プレビュー環境クリーンアップ ==="

# 7日以上古いプレビューサービスを確認
CUTOFF_DATE=$(date -d '7 days ago' -u +%Y-%m-%dT%H:%M:%S)
OLD_SERVICES=$(gcloud run services list \
    --region=asia-northeast1 \
    --filter="metadata.labels.type=preview AND metadata.creationTimestamp < '${CUTOFF_DATE}'" \
    --format="value(metadata.name)")

if [ -z "$OLD_SERVICES" ]; then
    echo "削除対象のサービスはありません"
else
    echo "削除対象サービス:"
    echo "$OLD_SERVICES"
    
    # 確認後削除
    read -p "削除しますか？ (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        echo "$OLD_SERVICES" | xargs -I {} gcloud run services delete {} \
            --region=asia-northeast1 \
            --quiet
        echo "削除完了"
    fi
fi
```

## セキュリティ考慮事項

### サービスアカウントの最小権限
現在の設定は開発環境用です。本番環境では以下を検討してください：

```bash
# より厳密な権限設定例
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.developer"  # adminではなくdeveloper

# 特定のサービスアカウントのみを使用
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser" \
    --condition='expression=request.auth.claims.email == "github-actions-preview@${PROJECT_ID}.iam.gserviceaccount.com"'
```

### ネットワークセキュリティ
```bash
# プレビュー環境へのアクセス制限（必要に応じて）
gcloud run services set-iam-policy penlight-pr-123 policy.yaml
```

## 更新・メンテナンス

### ワークフローの更新
```bash
# 新しい機能やセキュリティ修正を定期的に適用
git pull origin main
# .github/workflows/ の変更を確認
```

### 依存関係の更新
```bash
# GitHub Actions の更新
# actions/checkout@v4 → 最新版
# google-github-actions/auth@v2 → 最新版
```

このセットアップにより、開発効率を大幅に向上させる自動プレビュー環境が利用できます。