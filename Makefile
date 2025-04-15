prune-br:
	@git remote prune origin
	@git branch | xargs git branch -d

build:
	@docker build --target prod -t prod-view-penlight ./view

tag:
	@docker tag prod-view-penlight:latest harbor.aooba.net/penlight/prod-view-penlight:local-tmp-3

push:
	@docker -D push harbor.aooba.net/penlight/prod-view-penlight:local-tmp-3

run:
	@docker run -d \
		--name prod-view-penlight \
		-p 3000:3000 \
		prod-view-penlight

cd: build tag push
	@echo "Build, tag, and push completed."
