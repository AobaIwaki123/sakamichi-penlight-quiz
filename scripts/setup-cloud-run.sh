#!/bin/bash

# =============================================================================
# Cloud Run 自動デプロイメント環境 セットアップスクリプト
# 坂道ペンライトクイズアプリケーション用
# =============================================================================

set -e

# カラー出力の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ロゴ表示
echo -e "${BLUE}"
cat << "EOF"
 ____   _   _  _  ____   _   _  _____  ____   _   _  ____   __  
(  _ \ / \ ( \/ )(  _ \ / \ / \(_   _)(  _ \ ( ) ( )(  _ \ /  \ 
 )___///_\ \  /  )   ///_\ \  / ) (   )___/  )\_/(  )   /(  O )
(__) (_/ \_)\/  (__\_)_/ \_)\/  \_/  (__)   \___/ (__\_) \__/ 

Cloud Run Auto-Deploy Setup for Sakamichi Penlight Quiz
EOF
echo -e "${NC}"

echo -e "${GREEN}=== Cloud Run 自動デプロイメント環境セットアップ ===${NC}"
echo ""

# 関数定義
show_help() {
    echo -e "${CYAN}使用方法:${NC}"
    echo "  $0 [オプション] <プロジェクトID>"
    echo ""
    echo -e "${CYAN}オプション:${NC}"
    echo "  -h, --help          このヘルプを表示"
    echo "  -r, --region        Cloud Run リージョン (デフォルト: asia-northeast1)"
    echo "  -s, --skip-apis     API有効化をスキップ"
    echo "  -d, --dry-run       実際の作成は行わず、コマンドのみ表示"
    echo ""
    echo -e "${CYAN}例:${NC}"
    echo "  $0 my-penlight-project"
    echo "  $0 -r us-central1 my-penlight-project"
    echo "  $0 --dry-run my-penlight-project"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

# デフォルト設定
REGION="asia-northeast1"
SKIP_APIS=false
DRY_RUN=false

# 引数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -s|--skip-apis)
            SKIP_APIS=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -*)
            log_error "不明なオプション: $1"
            show_help
            exit 1
            ;;
        *)
            if [[ -z "$PROJECT_ID" ]]; then
                PROJECT_ID="$1"
            else
                log_error "複数のプロジェクトIDが指定されました"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# プロジェクトIDの確認
if [[ -z "$PROJECT_ID" ]]; then
    log_error "プロジェクトIDが指定されていません"
    show_help
    exit 1
fi

# DRY_RUN モードの表示
if [[ "$DRY_RUN" == "true" ]]; then
    log_warning "DRY_RUN モード: 実際の作成は行いません"
fi

# 設定値の表示
echo -e "${CYAN}=== 設定確認 ===${NC}"
echo "プロジェクトID: ${GREEN}$PROJECT_ID${NC}"
echo "リージョン: ${GREEN}$REGION${NC}"
echo "API有効化スキップ: ${GREEN}$SKIP_APIS${NC}"
echo "DRY_RUNモード: ${GREEN}$DRY_RUN${NC}"
echo ""

# 確認プロンプト
if [[ "$DRY_RUN" != "true" ]]; then
    echo -e "${YELLOW}この設定でセットアップを開始しますか？ (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_info "セットアップをキャンセルしました"
        exit 0
    fi
fi

# 実行用関数
run_command() {
    local cmd="$1"
    local description="$2"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${CYAN}[DRY_RUN] $description${NC}"
        echo -e "${CYAN}  → $cmd${NC}"
    else
        log_step "$description"
        eval "$cmd"
    fi
}

# メイン処理開始
echo -e "${GREEN}=== セットアップ開始 ===${NC}"

# Step 1: 前提条件の確認
log_step "前提条件の確認中..."

# gcloud CLI の確認
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI がインストールされていません"
    log_info "https://cloud.google.com/sdk/docs/install からインストールしてください"
    exit 1
fi
log_success "gcloud CLI が見つかりました"

# 認証確認
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    log_error "Google Cloud にログインしていません"
    log_info "gcloud auth login を実行してください"
    exit 1
fi
log_success "Google Cloud 認証が確認されました"

# プロジェクト設定
run_command "gcloud config set project $PROJECT_ID" "プロジェクトの設定"

# Step 2: API の有効化
if [[ "$SKIP_APIS" != "true" ]]; then
    log_step "必要な API の有効化中..."
    
    apis=(
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "artifactregistry.googleapis.com"
        "secretmanager.googleapis.com"
        "bigquery.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        run_command "gcloud services enable $api" "$api の有効化"
    done
    log_success "API の有効化が完了しました"
else
    log_warning "API 有効化をスキップしました"
fi

# Step 3: Artifact Registry の作成
log_step "Artifact Registry の設定中..."
run_command "gcloud artifacts repositories create penlight \
  --repository-format=docker \
  --location=$REGION \
  --description='坂道ペンライトクイズアプリ用Dockerイメージリポジトリ'" \
  "Docker リポジトリの作成"

# Step 4: サービスアカウントの作成
log_step "サービスアカウントの作成中..."

# Cloud Run 実行用サービスアカウント
run_command "gcloud iam service-accounts create cloud-run-penlight \
  --display-name='Cloud Run Penlight Service Account' \
  --description='坂道ペンライトクイズアプリ用のCloud Runサービスアカウント'" \
  "Cloud Run 実行用サービスアカウントの作成"

# GitHub Actions デプロイ用サービスアカウント
run_command "gcloud iam service-accounts create github-actions-deploy \
  --display-name='GitHub Actions Deploy Service Account' \
  --description='GitHub ActionsからCloud Runデプロイ用'" \
  "GitHub Actions デプロイ用サービスアカウントの作成"

# Step 5: 権限の設定
log_step "IAM 権限の設定中..."

# Cloud Run 実行用サービスアカウントの権限
cloud_run_sa="serviceAccount:cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com"

permissions_cloud_run=(
    "roles/bigquery.dataViewer"
    "roles/bigquery.jobUser"
    "roles/logging.logWriter"
    "roles/secretmanager.secretAccessor"
)

for role in "${permissions_cloud_run[@]}"; do
    run_command "gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member='$cloud_run_sa' \
      --role='$role'" \
      "Cloud Run SA に $role 権限を付与"
done

# GitHub Actions デプロイ用サービスアカウントの権限
github_actions_sa="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

permissions_github_actions=(
    "roles/run.admin"
    "roles/artifactregistry.writer"
    "roles/iam.serviceAccountUser"
    "roles/secretmanager.admin"
    "roles/logging.logWriter"
)

for role in "${permissions_github_actions[@]}"; do
    run_command "gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member='$github_actions_sa' \
      --role='$role'" \
      "GitHub Actions SA に $role 権限を付与"
done

# Step 6: サービスアカウントキーの生成
log_step "サービスアカウントキーの生成中..."

# 出力ディレクトリの作成
mkdir -p ./keys

run_command "gcloud iam service-accounts keys create ./keys/github-actions-key.json \
  --iam-account='github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com'" \
  "GitHub Actions 用キーの生成"

run_command "gcloud iam service-accounts keys create ./keys/cloud-run-sa-key.json \
  --iam-account='cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com'" \
  "Cloud Run 実行用キーの生成"

# Step 7: Secret Manager の設定
log_step "Secret Manager の設定中..."

run_command "gcloud secrets create bigquery-sa-key \
  --replication-policy='automatic'" \
  "BigQuery 用シークレットの作成"

if [[ "$DRY_RUN" != "true" ]]; then
    run_command "gcloud secrets versions add bigquery-sa-key \
      --data-file='./keys/cloud-run-sa-key.json'" \
      "BigQuery 認証情報の保存"
fi

run_command "gcloud secrets add-iam-policy-binding bigquery-sa-key \
  --member='$cloud_run_sa' \
  --role='roles/secretmanager.secretAccessor'" \
  "シークレット読み取り権限の付与"

# Step 8: Docker 認証の設定
log_step "Docker 認証の設定中..."
run_command "gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet" \
  "Docker 認証の設定"

# 完了メッセージ
echo ""
echo -e "${GREEN}🎉 セットアップが完了しました！${NC}"
echo ""

if [[ "$DRY_RUN" != "true" ]]; then
    echo -e "${CYAN}=== 次のステップ ===${NC}"
    echo ""
    echo -e "${YELLOW}1. GitHub Secrets の設定${NC}"
    echo "   以下の情報を GitHub リポジトリの Secrets に設定してください："
    echo ""
    echo -e "   ${BLUE}GCP_PROJECT_ID:${NC}"
    echo "   $PROJECT_ID"
    echo ""
    echo -e "   ${BLUE}GCP_SA_KEY:${NC}"
    echo "   $(cat ./keys/github-actions-key.json)"
    echo ""
    echo -e "   ${BLUE}CLOUD_RUN_SA_EMAIL:${NC}"
    echo "   cloud-run-penlight@${PROJECT_ID}.iam.gserviceaccount.com"
    echo ""
    echo -e "${YELLOW}2. テストデプロイの実行${NC}"
    echo "   develop ブランチにプッシュしてデプロイをテストしてください："
    echo ""
    echo "   git checkout develop"
    echo "   git commit --allow-empty -m 'test: Cloud Run デプロイテスト'"
    echo "   git push origin develop"
    echo ""
    echo -e "${YELLOW}3. 詳細なドキュメント${NC}"
    echo "   詳しい設定方法は以下のドキュメントを参照してください："
    echo "   - docs/cloud-run-setup.md"
    echo "   - docs/github-secrets-setup.md"
    echo ""
    
    # キーファイルのセキュリティ警告
    echo -e "${RED}⚠️  セキュリティ注意事項 ⚠️${NC}"
    echo "生成されたキーファイル (./keys/) は機密情報です。"
    echo "GitHub Secrets 設定後は必ず削除してください："
    echo ""
    echo -e "${RED}rm -rf ./keys/${NC}"
    echo ""
else
    echo -e "${CYAN}DRY_RUN モードでの実行が完了しました${NC}"
    echo "実際にセットアップを実行する場合は、--dry-run オプションを外して再実行してください"
fi

echo -e "${GREEN}セットアップスクリプトを終了します${NC}"