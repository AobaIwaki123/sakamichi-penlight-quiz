#!/bin/bash

# GCRへのローカルDockerイメージプッシュスクリプト
# 使用方法: ./scripts/push-to-gcr.sh <tag> [project-id]

set -e

# カラー出力の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘルプ表示
show_help() {
    echo -e "${BLUE}GCRへのDockerイメージプッシュスクリプト${NC}"
    echo ""
    echo "使用方法:"
    echo "  $0 <tag> [project-id]"
    echo ""
    echo "引数:"
    echo "  tag        : プッシュするイメージのタグ (例: local, dev-123, v1.0.0)"
    echo "  project-id : GCPプロジェクトID (省略時は環境変数から取得)"
    echo ""
    echo "例:"
    echo "  $0 local"
    echo "  $0 dev-$(git rev-parse --short HEAD)"
    echo "  $0 v1.0.0 my-gcp-project"
    echo ""
    echo "必要な環境変数:"
    echo "  GCP_PROJECT_ID  : GCPプロジェクトID (project-id引数が未指定の場合)"
    echo ""
    echo "必要な前提条件:"
    echo "  - Docker がインストールされていること"
    echo "  - gcloud CLI がインストールされ、認証済みであること"
    echo "  - GCRへのプッシュ権限があること"
}

# 引数チェック
if [ $# -eq 0 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

TAG="$1"
PROJECT_ID="${2:-$GCP_PROJECT_ID}"

# 設定値の検証
if [ -z "$TAG" ]; then
    echo -e "${RED}エラー: タグが指定されていません${NC}"
    show_help
    exit 1
fi

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}エラー: GCPプロジェクトIDが指定されていません${NC}"
    echo "環境変数 GCP_PROJECT_ID を設定するか、引数で指定してください"
    exit 1
fi

# 定数定義
GCR_REGISTRY="gcr.io"
IMAGE_NAME="penlight/prod-view-penlight"
LOCAL_IMAGE="penlight-view:latest"
GCR_IMAGE_TAG="${GCR_REGISTRY}/${PROJECT_ID}/${IMAGE_NAME}:${TAG}"

echo -e "${BLUE}=== GCRプッシュスクリプト ===${NC}"
echo -e "プロジェクトID: ${GREEN}${PROJECT_ID}${NC}"
echo -e "タグ: ${GREEN}${TAG}${NC}"
echo -e "ローカルイメージ: ${GREEN}${LOCAL_IMAGE}${NC}"
echo -e "GCRイメージ: ${GREEN}${GCR_IMAGE_TAG}${NC}"
echo ""

# Docker デーモンが起動しているかチェック
echo -e "${YELLOW}Dockerデーモンの確認中...${NC}"
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}エラー: Dockerデーモンが起動していません${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dockerデーモンが起動しています${NC}"

# ローカルイメージの存在確認
echo -e "${YELLOW}ローカルイメージの確認中...${NC}"
if ! docker image inspect "$LOCAL_IMAGE" >/dev/null 2>&1; then
    echo -e "${YELLOW}警告: ローカルイメージ '${LOCAL_IMAGE}' が見つかりません${NC}"
    echo -e "${BLUE}イメージをビルドしますか? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Dockerイメージをビルド中...${NC}"
        cd view
        docker build -t "$LOCAL_IMAGE" --target prod .
        cd ..
        echo -e "${GREEN}✓ イメージビルドが完了しました${NC}"
    else
        echo -e "${RED}エラー: ローカルイメージが必要です${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ ローカルイメージが見つかりました${NC}"
fi

# gcloud認証確認
echo -e "${YELLOW}gcloud認証の確認中...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo -e "${RED}エラー: gcloudで認証されていません${NC}"
    echo "以下のコマンドで認証してください:"
    echo "  gcloud auth login"
    exit 1
fi
echo -e "${GREEN}✓ gcloud認証が確認されました${NC}"

# GCR認証設定
echo -e "${YELLOW}GCR認証の設定中...${NC}"
if ! gcloud auth configure-docker --quiet; then
    echo -e "${RED}エラー: GCR認証の設定に失敗しました${NC}"
    exit 1
fi
echo -e "${GREEN}✓ GCR認証が設定されました${NC}"

# イメージのタグ付け
echo -e "${YELLOW}イメージにタグを付けています...${NC}"
if ! docker tag "$LOCAL_IMAGE" "$GCR_IMAGE_TAG"; then
    echo -e "${RED}エラー: イメージのタグ付けに失敗しました${NC}"
    exit 1
fi
echo -e "${GREEN}✓ イメージにタグが付けられました${NC}"

# GCRへプッシュ
echo -e "${YELLOW}GCRへプッシュ中...${NC}"
if ! docker push "$GCR_IMAGE_TAG"; then
    echo -e "${RED}エラー: GCRへのプッシュに失敗しました${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 プッシュが完了しました！${NC}"
echo -e "${BLUE}GCRイメージURL: ${GCR_IMAGE_TAG}${NC}"
echo ""
echo -e "${YELLOW}次のステップ:${NC}"
echo -e "1. Kubernetesマニフェストを更新:"
echo -e "   kubectl set image deployment/penlight-app penlight=${GCR_IMAGE_TAG}"
echo -e "2. またはArgoCD経由でデプロイ"
echo ""

# ローカルのタグ付きイメージをクリーンアップするか確認
echo -e "${BLUE}ローカルのタグ付きイメージを削除しますか? (y/n)${NC}"
read -r cleanup_response
if [[ "$cleanup_response" =~ ^[Yy]$ ]]; then
    docker rmi "$GCR_IMAGE_TAG" >/dev/null 2>&1 || true
    echo -e "${GREEN}✓ ローカルのタグ付きイメージを削除しました${NC}"
fi

echo -e "${GREEN}完了！${NC}"
