#!/bin/sh

set -eu

mode="deploy"
if [ "${1:-}" = "--dry-run" ]; then
  mode="dry-run"
elif [ "$#" -ne 0 ]; then
  printf '%s\n' "Usage: $0 [--dry-run]" >&2
  exit 2
fi

fail() {
  printf '%s\n' "deploy: $*" >&2
  exit 1
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "run from inside the Git repository"
cd "$repo_root"

[ "$(git branch --show-current)" = "master" ] || fail "switch to master before deploying"
[ -z "$(git status --porcelain)" ] || fail "commit or stash every local change before deploying"

git fetch --quiet origin master gh-pages

local_revision="$(git rev-parse HEAD)"
remote_revision="$(git rev-parse origin/master)"
[ "$local_revision" = "$remote_revision" ] || fail "push master to origin before deploying"

temporary_root="$(mktemp -d "${TMPDIR:-/tmp}/chernomord-deploy.XXXXXX")"
build_directory="$temporary_root/build"
publish_worktree="$temporary_root/gh-pages"
worktree_added=0

cleanup() {
  if [ "$worktree_added" -eq 1 ]; then
    git worktree remove --force "$publish_worktree" >/dev/null 2>&1 || true
  fi
  rm -rf "$temporary_root"
}
trap cleanup EXIT HUP INT TERM

hugo build --logLevel info --minify --cleanDestinationDir --destination "$build_directory"

git worktree add --quiet --detach "$publish_worktree" origin/gh-pages
worktree_added=1

if [ "$mode" = "dry-run" ]; then
  printf '%s\n' "Changes that would be published to gh-pages:"
  rsync -ani --delete --exclude '.git' "$build_directory/" "$publish_worktree/"
  exit 0
fi

rsync -a --delete --exclude '.git' "$build_directory/" "$publish_worktree/"
git -C "$publish_worktree" add --all

if git -C "$publish_worktree" diff --cached --quiet; then
  printf '%s\n' "gh-pages already matches master at $(git rev-parse --short HEAD)"
  exit 0
fi

git -C "$publish_worktree" commit -m "deploy: $(git rev-parse --short HEAD)"
git -C "$publish_worktree" push origin HEAD:gh-pages
printf '%s\n' "Published $(git rev-parse --short HEAD) to gh-pages"
