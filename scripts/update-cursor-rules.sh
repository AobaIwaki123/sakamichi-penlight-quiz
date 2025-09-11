#!/bin/bash

# Cursor Rules 手動更新スクリプト
# 使用方法: ./scripts/update-cursor-rules.sh [PR_NUMBER] [LABELS]

set -e

# 引数の処理
PR_NUMBER=${1:-"manual"}
LABELS=${2:-"manual"}
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 色付きログ出力用の関数
log_info() {
    echo -e "\033[36m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# Cursor Rules ディレクトリの確認
RULES_DIR=".cursor/rules"
if [ ! -d "$RULES_DIR" ]; then
    log_error "Cursor Rules ディレクトリが見つかりません: $RULES_DIR"
    exit 1
fi

log_info "Cursor Rules 更新スクリプトを開始します"
log_info "PR番号: $PR_NUMBER"
log_info "ラベル: $LABELS"
log_info "実行時刻: $TIMESTAMP"

# Git の状態確認
if ! git diff --quiet HEAD; then
    log_warning "コミットされていない変更があります。先にコミットしてください。"
    git status --short
    exit 1
fi

# 変更されたファイルの分析（PR番号が指定されている場合）
analyze_changes() {
    if [ "$PR_NUMBER" != "manual" ] && command -v gh >/dev/null 2>&1; then
        log_info "GitHub CLI を使用してPR情報を取得中..."
        
        # PR の変更ファイル一覧を取得
        CHANGED_FILES=$(gh pr view "$PR_NUMBER" --json files --jq '.files[].path' 2>/dev/null || echo "")
        
        if [ -n "$CHANGED_FILES" ]; then
            log_info "変更されたファイル:"
            echo "$CHANGED_FILES" | sed 's/^/  - /'
        else
            log_warning "PR情報を取得できませんでした。手動モードで継続します。"
        fi
    else
        log_info "手動モードで実行中..."
        CHANGED_FILES=""
    fi
}

# プロジェクト概要の更新
update_project_overview() {
    local rules_file="$RULES_DIR/project-overview.mdc"
    
    if [ ! -f "$rules_file" ]; then
        log_warning "プロジェクト概要ファイルが見つかりません: $rules_file"
        return
    fi
    
    log_info "プロジェクト概要を更新中..."
    
    # バックアップ作成
    cp "$rules_file" "$rules_file.backup"
    
    {
        echo ""
        echo "## 更新履歴"
        echo ""
        echo "### $TIMESTAMP - PR #$PR_NUMBER"
        echo "- **更新種別**: $LABELS"
        echo "- **更新者**: $(git config user.name)"
        echo ""
    } >> "$rules_file"
    
    log_success "プロジェクト概要を更新しました"
}

# フロントエンドアーキテクチャ統計の更新
update_frontend_stats() {
    local rules_file="$RULES_DIR/frontend-architecture.mdc"
    
    if [ ! -f "$rules_file" ]; then
        log_warning "フロントエンドアーキテクチャファイルが見つかりません: $rules_file"
        return
    fi
    
    log_info "フロントエンドアーキテクチャ統計を更新中..."
    
    # 統計情報を収集
    local component_count=0
    local store_count=0
    local hook_count=0
    local api_count=0
    
    if [ -d "view/components" ]; then
        component_count=$(find view/components -name "*.tsx" | wc -l)
    fi
    
    if [ -d "view/stores" ]; then
        store_count=$(find view/stores -name "*.ts" | wc -l)
    fi
    
    if [ -d "view/hooks" ]; then
        hook_count=$(find view/hooks -name "*.tsx" -o -name "*.ts" | wc -l)
    fi
    
    if [ -d "view/api" ]; then
        api_count=$(find view/api -name "*.ts" | wc -l)
    fi
    
    # バックアップ作成
    cp "$rules_file" "$rules_file.backup"
    
    {
        echo ""
        echo "## プロジェクト統計 (最終更新: $TIMESTAMP)"
        echo ""
        echo "- Reactコンポーネント数: $component_count"
        echo "- Zustandストア数: $store_count"
        echo "- カスタムフック数: $hook_count"
        echo "- API関数数: $api_count"
        echo "- 最終更新PR: #$PR_NUMBER"
        echo ""
    } >> "$rules_file"
    
    log_success "フロントエンドアーキテクチャ統計を更新しました"
}

# データパイプライン統計の更新
update_dataform_stats() {
    local rules_file="$RULES_DIR/dataform-pipeline.mdc"
    
    if [ ! -f "$rules_file" ]; then
        log_warning "データパイプラインファイルが見つかりません: $rules_file"
        return
    fi
    
    log_info "データパイプライン統計を更新中..."
    
    # 統計情報を収集
    local sql_count=0
    local source_count=0
    local intermediate_count=0
    local output_count=0
    
    if [ -d "definitions" ]; then
        sql_count=$(find definitions -name "*.sqlx" | wc -l)
    fi
    
    if [ -d "definitions/sources" ]; then
        source_count=$(find definitions/sources -name "*.js" | wc -l)
    fi
    
    if [ -d "definitions/intermediate" ]; then
        intermediate_count=$(find definitions/intermediate -name "*.sqlx" | wc -l)
    fi
    
    if [ -d "definitions/output" ]; then
        output_count=$(find definitions/output -name "*.sqlx" | wc -l)
    fi
    
    # バックアップ作成
    cp "$rules_file" "$rules_file.backup"
    
    {
        echo ""
        echo "## データパイプライン統計 (最終更新: $TIMESTAMP)"
        echo ""
        echo "- 総SQLファイル数: $sql_count"
        echo "- ソースファイル数: $source_count"
        echo "- 中間テーブル数: $intermediate_count"
        echo "- 出力テーブル数: $output_count"
        echo "- 最終更新PR: #$PR_NUMBER"
        echo ""
    } >> "$rules_file"
    
    log_success "データパイプライン統計を更新しました"
}

# インフラ設定の更新
update_infrastructure_info() {
    local rules_file="$RULES_DIR/deployment-infrastructure.mdc"
    
    if [ ! -f "$rules_file" ]; then
        log_warning "デプロイメントインフラファイルが見つかりません: $rules_file"
        return
    fi
    
    log_info "インフラ設定情報を更新中..."
    
    # バックアップ作成
    cp "$rules_file" "$rules_file.backup"
    
    {
        echo ""
        echo "## インフラ更新履歴 (最終更新: $TIMESTAMP)"
        echo ""
        echo "- PR #$PR_NUMBER による設定更新"
        echo "- 更新者: $(git config user.name)"
        echo ""
    } >> "$rules_file"
    
    log_success "インフラ設定情報を更新しました"
}

# 最終更新時刻の記録
update_timestamp() {
    local timestamp_file="$RULES_DIR/.last-update"
    
    log_info "最終更新時刻を記録中..."
    
    {
        echo "最終更新: $TIMESTAMP"
        echo "更新PR: #$PR_NUMBER"
        echo "更新者: $(git config user.name)"
        echo "更新種別: $LABELS"
    } > "$timestamp_file"
    
    log_success "最終更新時刻を記録しました"
}

# 変更の確認とコミット
commit_changes() {
    log_info "変更内容を確認中..."
    
    if git diff --quiet "$RULES_DIR/"; then
        log_info "Cursor Rulesに変更はありませんでした"
        return 0
    fi
    
    # 変更内容を表示
    echo ""
    log_info "=== Cursor Rules の変更内容 ==="
    git diff "$RULES_DIR/"
    echo ""
    
    # ユーザーに確認を求める（手動実行時のみ）
    if [ "$PR_NUMBER" = "manual" ] && [ -t 0 ]; then
        read -p "これらの変更をコミットしますか？ (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_warning "コミットがキャンセルされました"
            return 1
        fi
    fi
    
    # コミット実行
    git add "$RULES_DIR/"
    git commit -m "update: Cursor Rules更新 (PR #$PR_NUMBER)"
    
    log_success "Cursor Rulesの更新をコミットしました"
    
    # プッシュの確認（手動実行時のみ）
    if [ "$PR_NUMBER" = "manual" ] && [ -t 0 ]; then
        read -p "変更をプッシュしますか？ (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push
            log_success "変更をプッシュしました"
        fi
    else
        git push
        log_success "変更をプッシュしました"
    fi
}

# バックアップファイルのクリーンアップ
cleanup_backups() {
    log_info "バックアップファイルをクリーンアップ中..."
    find "$RULES_DIR" -name "*.backup" -delete
    log_success "バックアップファイルをクリーンアップしました"
}

# メイン処理の実行
main() {
    analyze_changes
    
    # 各種更新処理を実行
    if [ "$LABELS" = "major" ] || [ "$LABELS" = "minor" ] || [ "$LABELS" = "manual" ]; then
        update_project_overview
    fi
    
    update_frontend_stats
    update_dataform_stats
    update_infrastructure_info
    update_timestamp
    
    # 変更をコミット
    if commit_changes; then
        cleanup_backups
        log_success "Cursor Rules の更新が完了しました！"
    else
        log_error "コミット処理でエラーが発生しました"
        exit 1
    fi
}

# エラーハンドリング
trap 'log_error "スクリプト実行中にエラーが発生しました (行 $LINENO)"; exit 1' ERR

# メイン処理の実行
main

log_success "Cursor Rules 更新スクリプトが正常に完了しました"