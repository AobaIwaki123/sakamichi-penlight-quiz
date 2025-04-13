prune-br:
	@git remote prune origin
	@git branch | xargs git branch -d

build:
	@docker build --target prod -t prod-view-penlight ./view

sh:
	@docker run -it prod-view-penlight sh

tag:
	@docker tag prod-view-penlight:latest harbor.aooba.net/penlight/prod-view-penlight:latest

push:
	@docker -D push harbor.aooba.net/penlight/prod-view-penlight:latest
