#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Build and publish a client site's static export to the
# Hostinger preview path: sortmydigital.site/preview/<slug>/
#
# Runs inside the client repo. Builds with PREVIEW_BASE_PATH,
# then rewrites root-absolute src/href/url() refs that Next's
# basePath doesn't cover (plain <img>, <a>, CSS url()) so assets
# resolve under the preview subdirectory.
#
# Usage:
#   ./deploy-preview.sh /path/to/client-repo <slug>
#   ./deploy-preview.sh ~/Projects/jp-plumbing jp-plumbing
#
# Requires: pnpm, ssh key $SSH_KEY_FILE (default ~/.ssh/sorted_deploy)
# ─────────────────────────────────────────────────────────────

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: deploy-preview.sh <client-repo-dir> <slug>"
  exit 1
fi

REPO_DIR="$1"
SLUG="$2"
BASE="/preview/$SLUG"
SSH_KEY_FILE="${SSH_KEY_FILE:-$HOME/.ssh/sorted_deploy}"
SSH_HOST="82.29.157.61"
SSH_PORT="65002"
SSH_USER="u212019412"
REMOTE_DIR="~/domains/sortmydigital.site/public_html$BASE"

cd "$REPO_DIR"

echo "Building $SLUG with base path $BASE ..."
PREVIEW_BASE_PATH="$BASE" pnpm build

# Rewrite root-absolute refs that basePath doesn't cover:
#   src="/..." href="/..." in HTML, url(/...) in CSS
# Skips refs already carrying the preview prefix and protocol
# relatives (//).
echo "Rewriting root-absolute refs under $BASE ..."
find out -name "*.html" -type f -exec perl -pi -e \
  "s{(src|href)=\"/(?!preview/|/)}{\$1=\"$BASE/}g" {} +
find out/_next -name "*.css" -type f -exec perl -pi -e \
  "s{url\\(/(?!preview/)}{url($BASE/}g" {} +

echo "Deploying to $SSH_HOST:$REMOTE_DIR ..."
ssh -p "$SSH_PORT" -i "$SSH_KEY_FILE" "$SSH_USER@$SSH_HOST" \
  "mkdir -p $REMOTE_DIR"
scp -P "$SSH_PORT" -i "$SSH_KEY_FILE" -rq out/* \
  "$SSH_USER@$SSH_HOST:$REMOTE_DIR/"

echo ""
echo "Live: https://sortmydigital.site$BASE/"
