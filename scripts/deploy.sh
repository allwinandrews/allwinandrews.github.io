#!/usr/bin/env bash
# Build the site and publish dist/ to the gh-pages branch.
# GitHub Pages serves that branch (Settings > Pages > Deploy from a branch).
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
touch dist/.nojekyll
remote=$(git remote get-url origin)
rev=$(git rev-parse --short HEAD)
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $rev"
git push -f -q "$remote" gh-pages
rm -rf .git
echo "Published $rev to gh-pages"
