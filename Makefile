# =============================================================================
# 坂道ペンライトクイズ - Makefile
# Docker ビルド、デプロイメント、開発支援コマンド集
# =============================================================================

# デフォルトターゲット（引数なしでmakeを実行した場合）
.DEFAULT_GOAL := help

# PHONY ターゲット（実際のファイルと名前が競合しないように）
.PHONY: help build run push-gcr cd-gcr sync prune-br dev

# =============================================================================
# ヘルプ・情報表示
# =============================================================================

## ヘルプ: 利用可能なコマンド一覧を表示
help:
	@echo "======================================================================="
	@echo "  坂道ペンライトクイズ - Make コマンド集"
	@echo "======================================================================="
	@echo ""
	@echo "📋 情報・ヘルプ:"
	@echo "  help                    このヘルプを表示"
	@echo ""
	@echo "🛠️  開発・テスト:"
	@echo "  dev                     Docker Compose で開発環境を起動"
	@echo "  dev-down               開発環境を停止・削除"
	@echo "  prune-br               不要なGitブランチを削除"
	@echo ""
	@echo "🏗️  ビルド・実行:"
	@echo "  build                  本番用Dockerイメージをビルド"
	@echo "  run                    ビルドしたイメージをローカルで実行"
	@echo ""
	@echo "🚀 デプロイメント:"
	@echo "  push-gcr TAG=<tag>     GCRにイメージをプッシュ"
	@echo "  cd-gcr [TAG=<tag>]     ビルド〜GCRプッシュを一括実行"
	@echo "  sync TOKEN=<token>     ArgoCD同期を強制実行"
	@echo ""
	@echo "💡 使用例:"
	@echo "  make dev                          # 開発環境起動"
	@echo "  make cd-gcr TAG=v3.0.4           # v3.0.4でビルド&デプロイ"
	@echo "  make sync TOKEN=\$$ARGOCD_TOKEN   # ArgoCD同期"
	@echo ""
	@echo "ℹ️  詳細は README.md を参照してください"
	@echo "======================================================================="

# =============================================================================
# 開発・テスト環境
# =============================================================================

## 開発: Docker Compose で開発環境を起動（ホットリロード有効）
dev:
	@echo "🚀 開発環境を起動中..."
	@echo "💡 http://localhost:3000 でアクセスできます"
	@docker-compose up -d
	@echo "✅ 開発環境が起動しました"

## 開発停止: Docker Compose 環境を停止・削除
dev-down:
	@echo "🛑 開発環境を停止中..."
	@docker-compose down -v
	@echo "✅ 開発環境を停止しました"

## Git: 不要なブランチを削除（リモート追跡ブランチも含む）
prune-br:
	@echo "🧹 不要なGitブランチを削除中..."
	@git remote prune origin
	@git branch | grep -v main | xargs -r git branch -d || true
	@echo "✅ ブランチクリーンアップが完了しました"

# =============================================================================
# ビルド・実行
# =============================================================================

## ビルド: 本番用Dockerイメージをビルド
build:
	@echo "🏗️  本番用Dockerイメージをビルド中..."
	@docker build --target prod -t penlight-view:latest ./view
	@echo "✅ イメージビルドが完了しました: penlight-view:latest"

## 実行: ビルドしたイメージをローカルで実行（本番環境テスト用）
run:
	@echo "🚀 本番イメージをローカルで起動中..."
	@echo "💡 http://localhost:3000 でアクセスできます"
	@docker run -d \
		--name prod-view-penlight \
		-p 3000:3000 \
		penlight-view:latest
	@echo "✅ コンテナが起動しました: prod-view-penlight"

# =============================================================================
# デプロイメント
# =============================================================================

## GCRプッシュ: Google Container Registry にイメージをプッシュ
push-gcr:
	@if [ -z "$(TAG)" ]; then \
		echo "❌ エラー: TAGパラメータが必要です"; \
		echo ""; \
		echo "📖 使用方法:"; \
		echo "   make push-gcr TAG=<タグ名>"; \
		echo ""; \
		echo "💡 例:"; \
		echo "   make push-gcr TAG=v3.0.4"; \
		echo "   make push-gcr TAG=local"; \
		echo "   make push-gcr TAG=dev-$(shell git rev-parse --short HEAD)"; \
		exit 1; \
	fi
	@echo "📦 GCRにプッシュ中: TAG=$(TAG)"
	@./scripts/push-to-gcr.sh $(TAG)
	@echo "✅ GCRプッシュが完了しました"

## 一括デプロイ: ビルド → GCRプッシュを一括実行
cd-gcr: build
	@if [ -z "$(TAG)" ]; then \
		TAG="local-$(shell git rev-parse --short HEAD)"; \
		echo "🏷️  TAGが未指定のため自動生成: $$TAG"; \
	else \
		echo "🏷️  指定されたTAG: $(TAG)"; \
	fi && \
	echo "📦 一括デプロイを実行中..." && \
	./scripts/push-to-gcr.sh $$TAG && \
	echo "✅ 一括デプロイが完了しました: $$TAG"

## ArgoCD同期: クラスターに手動で同期を実行
sync:
	@if [ -z "$(TOKEN)" ]; then \
		echo "❌ エラー: TOKENパラメータが必要です"; \
		echo ""; \
		echo "📖 使用方法:"; \
		echo "   make sync TOKEN=<ArgoCD認証トークン>"; \
		echo ""; \
		echo "💡 例:"; \
		echo "   export ARGOCD_TOKEN=your-token"; \
		echo "   make sync TOKEN=\$$ARGOCD_TOKEN"; \
		exit 1; \
	fi
	@echo "🔄 ArgoCD同期を実行中..."
	@curl -X POST https://argocd.aooba.net/api/v1/applications/penlight/sync \
		-H "Authorization: Bearer $(TOKEN)" \
		-H "Content-Type: application/json" \
		-w "\n✅ 同期ステータス: %{http_code}\n" || \
		echo "❌ 同期に失敗しました"
