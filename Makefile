prune-br:
	@git remote prune origin
	@git branch | xargs git branch -d

build:
	@docker build --target prod -t prod-view-penlight ./view
