#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Sorted Website Manufacturing Line — Start Build
#
# Single entry point for initiating a new website build.
# Creates a sibling project folder, scaffolds the site template,
# copies inputs, and initialises the factory job.
#
# Usage:
#   ./start-build.sh <client-slug> <mockup-path> <manifest-path>
#
# Example:
#   ./start-build.sh lrt-plumbing ~/Downloads/mockup.png ~/Downloads/manifest.json
# ─────────────────────────────────────────────────────────────

set -euo pipefail

# ── Args ──────────────────────────────────────────────────────

CLIENT_SLUG="${1:?Usage: start-build.sh <client-slug> <mockup-path> <manifest-path>}"
MOCKUP_PATH="${2:?Usage: start-build.sh <client-slug> <mockup-path> <manifest-path>}"
MANIFEST_PATH="${3:?Usage: start-build.sh <client-slug> <mockup-path> <manifest-path>}"

# ── Paths ─────────────────────────────────────────────────────

SORTED_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
TEMPLATE_DIR="$SORTED_DIR/templates/client-site"
PROJECTS_DIR="$(dirname "$SORTED_DIR")"
BUILD_DIR="$PROJECTS_DIR/$CLIENT_SLUG"
FACTORY_CLI="$SORTED_DIR/operators/factory-orchestrator/dist/cli.js"

# ── Validate inputs ───────────────────────────────────────────

if [ ! -f "$MOCKUP_PATH" ]; then
  echo "ERROR: Mockup not found at $MOCKUP_PATH"
  exit 1
fi

if [ ! -f "$MANIFEST_PATH" ]; then
  echo "ERROR: Manifest not found at $MANIFEST_PATH"
  exit 1
fi

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "ERROR: Client-site template not found at $TEMPLATE_DIR"
  exit 1
fi

if [ -d "$BUILD_DIR" ]; then
  echo "ERROR: Build directory already exists: $BUILD_DIR"
  echo "       To resume an existing build, run:"
  echo "       node $FACTORY_CLI resume $BUILD_DIR"
  exit 1
fi

# ── 1. Create project folder (sibling to sorted) ──────────────

echo ""
echo "Sorted Website Manufacturing Line"
echo "────────────────────────────────────────"
echo "  Client slug : $CLIENT_SLUG"
echo "  Mockup      : $MOCKUP_PATH"
echo "  Manifest    : $MANIFEST_PATH"
echo "  Build dir   : $BUILD_DIR"
echo ""

mkdir -p "$BUILD_DIR"

# ── 2. Scaffold site from template ────────────────────────────

echo "Scaffolding site from client-site template..."
cp -r "$TEMPLATE_DIR/"* "$BUILD_DIR/"
# Copy hidden files (.gitignore etc)
cp -r "$TEMPLATE_DIR/".* "$BUILD_DIR/" 2>/dev/null || true
# Remove template-specific files not needed
rm -f "$BUILD_DIR/client-delivery-quote.tsx.template" 2>/dev/null || true

# ── 3. Copy inputs ────────────────────────────────────────────

echo "Copying mockup and manifest to input/..."
mkdir -p "$BUILD_DIR/input"
cp "$MOCKUP_PATH" "$BUILD_DIR/input/approved-mockup.png"
cp "$MANIFEST_PATH" "$BUILD_DIR/input/image-manifest.json"

# ── 4. Initialise factory job ─────────────────────────────────

echo "Initialising factory job..."
node "$FACTORY_CLI" init \
  "$BUILD_DIR/input/approved-mockup.png" \
  "$BUILD_DIR/input/image-manifest.json" \
  "$CLIENT_SLUG" \
  --build-dir "$BUILD_DIR"

# ── 5. Print next steps ───────────────────────────────────────

echo ""
echo "────────────────────────────────────────"
echo "Build ready. Next steps:"
echo ""
echo "  1. Run operators 0-5 (build-init → visual-qa):"
echo "     node $FACTORY_CLI resume $BUILD_DIR"
echo ""
echo "  2. After Op 5 (visual-qa), switch to a vision model"
echo "     for human-vision-qa (Op 5b):"
echo "     - Compare screenshots to mockup"
echo "     - Mark passed/skipped/failed"
echo ""
echo "  3. Continue with Op 7+ (design-system, etc.)"
echo ""
echo "  To check status at any time:"
echo "     node $FACTORY_CLI status $BUILD_DIR"
echo ""
