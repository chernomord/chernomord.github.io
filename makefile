.PHONY: help run build verify deploy deploy-dry-run

help:
	@printf '%s\n' 'make run             Start the local Hugo server'
	@printf '%s\n' 'make build           Build the production site into public/'
	@printf '%s\n' 'make verify          Build with deprecation warnings visible'
	@printf '%s\n' 'make deploy-dry-run  Compare a fresh build with origin/gh-pages'
	@printf '%s\n' 'make deploy          Build and publish the current origin/master to gh-pages'

run:
	hugo server

build:
	hugo --minify

verify:
	hugo build --logLevel info

deploy:
	./scripts/deploy-gh-pages.sh

deploy-dry-run:
	./scripts/deploy-gh-pages.sh --dry-run
