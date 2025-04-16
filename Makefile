prune-br:
	@git remote prune origin
	@git branch | xargs git branch -d

build:
	@docker build --target prod -t prod-view-penlight ./view

tag:
	@docker tag prod-view-penlight:latest harbor.aooba.net/penlight/prod-view-penlight:local-tmp-4

push:
	@docker -D push harbor.aooba.net/penlight/prod-view-penlight:local-tmp-4

run:
	@docker run -d \
		--name prod-view-penlight \
		-p 3000:3000 \
		prod-view-penlight

cd: build tag push
	@echo "Build, tag, and push completed."

sync:
	@curl -X POST https://argocd.aooba.net/api/v1/applications/penlight/sync \
	 -H "Authorization: Bearer $(TOKEN)" \
	 -H "Content-Type: application/json"
