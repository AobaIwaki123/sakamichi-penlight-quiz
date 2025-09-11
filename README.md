# 坂道グループペンライトクイズ

[![CI](https://github.com/AobaIwaki123/sakamichi-penlight-quiz/actions/workflows/ci.yml/badge.svg)](https://github.com/AobaIwaki123/sakamichi-penlight-quiz/actions/workflows/ci.yml)

Deep Wiki: https://deepwiki.com/AobaIwaki123/sakamichi-penlight-quiz

<div style="display: flex; justify-content: center; gap: 10px;">
  <img src="imgs/v1.png" alt="alt text" width="300">
</div>

## 注意

レスポンシブ対応が苦手すぎて、横画面のレイアウトはかなり崩れています。
是非縦画面で楽しんでください。

## 技術スタック

- Nextjs
- Mantine UI
- Zustand

## 開発・デプロイ

### ローカル開発
```bash
# 開発サーバー起動
cd view/
pnpm dev

# または Docker Compose で起動
docker compose up -d
```

### GCRへのデプロイ

#### 前提条件
- Docker がインストールされていること
- gcloud CLI がインストールされ、認証済みであること
- GCRへのプッシュ権限があること
- 環境変数 `GCP_PROJECT_ID` が設定されていること

#### スクリプトを使用したプッシュ

```bash
# 基本的な使用方法
./scripts/push-to-gcr.sh <tag> [project-id]

# 例
./scripts/push-to-gcr.sh local
./scripts/push-to-gcr.sh dev-$(git rev-parse --short HEAD)
./scripts/push-to-gcr.sh v1.0.0 my-gcp-project

# 環境変数でプロジェクトIDを設定
export GCP_PROJECT_ID=your-project-id
./scripts/push-to-gcr.sh local
```

#### Makefileを使用したプッシュ
```bash
# ビルドのみ
make build

# 指定タグでGCRにプッシュ
make push-gcr TAG=local
make push-gcr TAG=v1.0.0

# ビルド + プッシュ（一括）
make cd-gcr TAG=local

# タグ未指定の場合、自動的に local-{git-hash} が使用される
make cd-gcr
```

#### 従来のHarborへのプッシュ（下位互換性）
```bash
make build
make tag
make push
make cd  # 一括実行
```

### 認証設定

#### gcloud CLI認証
```bash
# ログイン
gcloud auth login

# プロジェクト設定
gcloud config set project YOUR_PROJECT_ID

# GCR認証設定（自動実行されるので通常は不要）
gcloud auth configure-docker
```

#### 環境変数設定
```bash
# プロジェクトID
export GCP_PROJECT_ID=your-gcp-project-id

# BigQuery認証（開発環境）
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## プッシュされたイメージの確認

GCRにプッシュされたイメージは以下のURLで確認できます：
- GCRコンソール: https://console.cloud.google.com/gcr/images/YOUR_PROJECT_ID
- イメージURI: `gcr.io/YOUR_PROJECT_ID/penlight/prod-view-penlight:TAG`

# 参考

- [メンバーの絵文字一覧](https://w.atwiki.jp/hinatazaka46liveinfo/pages/70.html)
