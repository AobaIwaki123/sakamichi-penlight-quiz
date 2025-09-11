prune-br:
	@git remote prune origin
	@git branch | xargs git branch -d

build:
	@docker build --target prod -t penlight-view:latest ./view

# GCRへのプッシュ（引数でタグを指定）
push-gcr:
	@if [ -z "$(TAG)" ]; then \
		echo "Usage: make push-gcr TAG=<tag>"; \
		echo "Example: make push-gcr TAG=local"; \
		exit 1; \
	fi
	@./scripts/push-to-gcr.sh $(TAG)

run:
	@docker run -d \
		--name prod-view-penlight \
		-p 3000:3000 \
		penlight-view:latest

# GCRへの一括デプロイ
cd-gcr: build
	@if [ -z "$(TAG)" ]; then \
		TAG=local-$(shell git rev-parse --short HEAD); \
	fi && \
	./scripts/push-to-gcr.sh $$TAG

sync:
	@curl -X POST https://argocd.aooba.net/api/v1/applications/penlight/sync \
	 -H "Authorization: Bearer $(TOKEN)" \
	 -H "Content-Type: application/json"
