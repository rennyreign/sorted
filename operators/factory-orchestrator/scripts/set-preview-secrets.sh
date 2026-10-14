#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Set the Hostinger deploy secrets on a client repo so
# .github/workflows/deploy-preview.yml can publish previews to
# sortmydigital.site/preview/<repo-name>/.
#
# Usage:
#   ./set-preview-secrets.sh <repo-name>
#   ./set-preview-secrets.sh jp-plumbing          # -> rennyreign/jp-plumbing
#   ./set-preview-secrets.sh owner/jp-plumbing    # explicit owner
#
# Key file defaults to ~/.ssh/sorted_deploy (the verified deploy key).
# Override with SSH_KEY_FILE=/path/to/key.
# ─────────────────────────────────────────────────────────────

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: set-preview-secrets.sh <repo-name>"
  exit 1
fi

REPO="$1"
[[ "$REPO" != */* ]] && REPO="rennyreign/$REPO"

SSH_KEY_FILE="${SSH_KEY_FILE:-$HOME/.ssh/sorted_deploy}"

if [ ! -f "$SSH_KEY_FILE" ]; then
  echo "ERROR: deploy key not found at $SSH_KEY_FILE"
  echo "       Set SSH_KEY_FILE=/path/to/key and retry."
  exit 1
fi

# Values documented in sorted/AGENTS.md (Hostinger SSH section)
gh secret set SSH_HOST        --repo "$REPO" --body "82.29.157.61"
gh secret set SSH_USERNAME    --repo "$REPO" --body "u212019412"
gh secret set SSH_PORT        --repo "$REPO" --body "65002"
gh secret set SSH_PRIVATE_KEY --repo "$REPO" < "$SSH_KEY_FILE"

echo "Deploy secrets set on $REPO"
echo "Preview URL after first main push: https://sortmydigital.site/preview/$(basename "$REPO")/"
