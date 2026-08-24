# Deploying to GitHub Pages

`master` contains the Hugo source; `gh-pages` contains only the generated
site. Do not merge or rebase one branch into the other.

## Normal deployment

1. Commit the source changes on `master`.
2. Push `master` to `origin`.
3. Run `make deploy-dry-run` to inspect the generated-file changes.
4. Run `make deploy` to publish them.

The deploy command refuses a dirty tree and a local `master` that has not been
pushed. It builds into a temporary directory, checks out `origin/gh-pages` in
a temporary worktree, replaces only that worktree's generated files, commits,
and pushes it. The source worktree is never switched to `gh-pages`.

If a concurrent deploy moves `gh-pages`, the push fails safely. Do not rebase
it onto `master`; rerun the command so it fetches the new publish branch and
generates a fresh output commit.

## Manual equivalent

From a clean, pushed `master`:

```sh
git fetch origin master gh-pages
TEMP_ROOT="$(mktemp -d /tmp/chernomord-deploy.XXXXXX)"
hugo build --logLevel info --minify --cleanDestinationDir --destination "$TEMP_ROOT/build"
git worktree add --detach "$TEMP_ROOT/gh-pages" origin/gh-pages
rsync -a --delete --exclude '.git' "$TEMP_ROOT/build/" "$TEMP_ROOT/gh-pages/"
git -C "$TEMP_ROOT/gh-pages" add --all
git -C "$TEMP_ROOT/gh-pages" commit -m "deploy: $(git rev-parse --short HEAD)"
git -C "$TEMP_ROOT/gh-pages" push origin HEAD:gh-pages
git worktree remove "$TEMP_ROOT/gh-pages"
rm -rf "$TEMP_ROOT"
```

The `rsync --delete` step is intentional: it makes the publish branch exactly
match the new Hugo output. Its target must remain the temporary worktree, never
the source repository.
