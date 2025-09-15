# GitHub Actions ワークフロー

このディレクトリには、坂道ペンライトクイズプロジェクトのCI/CDパイプラインが含まれています。

## ワークフロー一覧

### 1. 本番デプロイ (`deploy.yml`)
- **トリガー**: `main`ブランチへのpush、手動実行
- **機能**: 本番環境（Kubernetes）へのデプロイ
- **対象**: 本番リリース用

### 2. ブランチプレビュー (`branch-preview.yml`) 🆕
- **トリガー**: PR作成・更新、feature/fix/refactor ブランチへのpush
- **機能**: Cloud Runでのプレビュー環境自動作成
- **対象**: 開発・レビュー用

### 3. プレビュークリーンアップ (`cleanup-preview.yml`) 🆕
- **トリガー**: PRクローズ、ブランチ削除、手動実行
- **機能**: 不要なプレビュー環境の自動削除
- **対象**: リソース管理・コスト削減用

## ブランチプレビュー機能

### 概要
プルリクエストや開発ブランチに対して、自動的にCloud Runでプレビュー環境を作成します。

### 対応ブランチ
- `feature/**` - 新機能開発
- `fix/**` - バグ修正
- `refactor/**` - リファクタリング
- `develop` - 開発統合ブランチ
- PR（Pull Request）

### 自動作成される環境
- **Cloud Run サービス**: `penlight-pr-{番号}` または `penlight-{ブランチ名}`
- **URL**: `https://penlight-pr-123-xxxxxxxxxx-an.a.run.app`
- **設定**: 
  - メモリ: 1GB
  - CPU: 1コア
  - 最大インスタンス: 2
  - 環境変数: `NODE_ENV=development`, `USE_MOCK=true`

### 自動削除タイミング
- PRクローズ時
- ブランチ削除時
- 手動実行（管理者用）

## 必要な設定

### GitHub Secrets
以下のシークレットをGitHubリポジトリに設定してください：

```bash
# Google Cloud Platform
GCP_PROJECT_ID        # GCPプロジェクトID
GCP_SA_KEY           # サービスアカウントキー（JSON形式）

# ArgoCD（既存）
ARGOCD_TOKEN         # ArgoCD API トークン
```

### Google Cloud 権限
サービスアカウントに以下の権限が必要です：

```yaml
# 最小権限の例
roles:
  - roles/run.admin                    # Cloud Run管理
  - roles/storage.admin               # Container Registry
  - roles/iam.serviceAccountUser      # サービスアカウント使用
```

### Cloud Run設定
プレビュー環境では以下の設定を使用：

```yaml
# リソース制限
memory: 1Gi
cpu: 1
min_instances: 0
max_instances: 2
timeout: 300s
concurrency: 100

# 環境変数
NODE_ENV: development
USE_MOCK: "true"

# ラベル
environment: preview
type: preview
branch: "{ブランチ名}"
```

## 使用方法

### プレビュー環境の作成

#### 1. プルリクエスト作成時
```bash
# 1. 機能ブランチを作成
git checkout -b feature/new-quiz-mode

# 2. 変更をコミット
git add .
git commit -m "feat: 新しいクイズモードを追加"

# 3. プッシュ
git push origin feature/new-quiz-mode

# 4. PRを作成
# → 自動的にプレビュー環境が作成される
```

#### 2. 開発ブランチへの直接プッシュ
```bash
# feature/fix/refactor ブランチにプッシュするだけで自動作成
git push origin feature/awesome-feature
```

### プレビュー環境の確認

#### PRコメントで確認
PRを作成すると、自動的にコメントが追加されます：

```markdown
## 🚀 プレビュー環境デプロイ完了

**プレビューURL**: https://penlight-pr-123-xxxxxxxxxx-an.a.run.app

### 📋 デプロイ情報
- **サービス名**: penlight-pr-123
- **イメージタグ**: pr-123-a1b2c3d4
- **リージョン**: asia-northeast1
- **環境**: 開発モード（モックデータ使用）
```

#### GitHub Actions で確認
1. リポジトリの「Actions」タブを開く
2. 「Branch Preview Environment」ワークフローを選択
3. 実行結果とログを確認

#### Google Cloud Console で確認
1. [Cloud Run コンソール](https://console.cloud.google.com/run)を開く
2. `penlight-pr-*` または `penlight-*` サービスを確認
3. ログやメトリクスを監視

### 手動クリーンアップ

#### GitHub Actions で手動削除
1. リポジトリの「Actions」タブを開く
2. 「Cleanup Preview Environment」を選択
3. 「Run workflow」をクリック
4. サービス名を入力して実行

```yaml
# 手動実行の例
service_name: penlight-pr-123
force_delete: true  # 確認をスキップ
```

#### gcloud CLI で直接削除
```bash
# サービス一覧を確認
gcloud run services list --region=asia-northeast1

# 特定サービスを削除
gcloud run services delete penlight-pr-123 \
  --region=asia-northeast1 \
  --quiet
```

## トラブルシューティング

### よくある問題

#### 1. プレビュー環境が作成されない
**原因と対策**:
- ブランチ名が対象外 → `feature/`, `fix/`, `refactor/` で始まるブランチ名を使用
- ファイル変更が対象外 → `view/` ディレクトリ内のファイルを変更
- 権限不足 → GitHub Secrets とGCPサービスアカウントの権限を確認

#### 2. デプロイに失敗する
**原因と対策**:
- Dockerビルドエラー → ローカルで `docker build` を実行して確認
- GCPクォータ超過 → Cloud Runの使用量を確認
- 権限不足 → サービスアカウントの権限を確認

#### 3. プレビュー環境にアクセスできない
**原因と対策**:
- Cloud Runサービスの起動待ち → 数分待ってから再試行
- アプリケーションエラー → Cloud Run のログを確認
- ネットワーク設定 → `--allow-unauthenticated` 設定を確認

### ログの確認方法

#### GitHub Actions ログ
```bash
# ワークフロー実行ページで各ステップのログを確認
# 失敗した場合は赤いステップをクリック
```

#### Cloud Run ログ
```bash
# gcloud CLI
gcloud logs read --limit=50 \
  --filter="resource.type=cloud_run_revision AND resource.labels.service_name=penlight-pr-123"

# または Google Cloud Console のログビューアー
```

### コスト管理

#### 自動削除の仕組み
- PR クローズ時: 即座に削除
- ブランチ削除時: 即座に削除
- 古いイメージ: 30日後に自動削除

#### 手動監視
```bash
# 現在のプレビューサービス一覧
gcloud run services list \
  --region=asia-northeast1 \
  --filter="metadata.labels.type=preview"

# 不要なサービスの一括削除
gcloud run services list \
  --region=asia-northeast1 \
  --filter="metadata.labels.type=preview" \
  --format="value(metadata.name)" | \
  xargs -I {} gcloud run services delete {} \
    --region=asia-northeast1 \
    --quiet
```

## ベストプラクティス

### 開発フロー
1. **ブランチ命名**: `feature/`, `fix/`, `refactor/` プレフィックスを使用
2. **小さなPR**: レビューしやすいサイズでPRを作成
3. **プレビュー確認**: マージ前にプレビュー環境で動作確認
4. **早期クリーンアップ**: 不要になったらすぐにPRをクローズ

### リソース管理
1. **定期監視**: 週次でプレビュー環境の棚卸し
2. **コスト監視**: GCPコンソールで使用量を定期確認
3. **自動削除**: 30日以上古いリソースは自動削除

### セキュリティ
1. **最小権限**: サービスアカウントは必要最小限の権限のみ
2. **シークレット管理**: GitHub Secrets の適切な管理
3. **アクセス制御**: 必要に応じてCloud Run のIAM設定を調整

## 更新履歴

### 2025-09-15
- ブランチプレビュー機能を追加 (`branch-preview.yml`)
- 自動クリーンアップ機能を追加 (`cleanup-preview.yml`)
- Cloud Run を使用したプレビュー環境の実装
- PR コメント自動投稿機能
- 古いDockerイメージの自動削除機能