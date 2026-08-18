// ─────────────────────────────────────────────────────────────
// Asset Generator — Real Photo Lookup
// Checks whether a client has supplied a real photo for a given
// human asset id, so the ladder can enhance/upscale it with GPT
// instead of generating a stand-in AI human.
//
// Two ways to point at real photos:
//   --real-photos-map <path.json>   { "asset_id": "filename.jpg", ... }  (preferred — explicit, no guessing)
//   --real-photos-dir <dir>         falls back to an exact `<asset_id>.<ext>` match in the directory
// If neither is configured, or no match is found, returns null —
// the ladder then falls to the AI-generated placeholder human path.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function loadMap(mapPath?: string): Record<string, string> | null {
  if (!mapPath || !fs.existsSync(mapPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
  } catch {
    return null;
  }
}

export function resolveRealPhoto(
  assetId: string,
  realPhotosDir: string | undefined,
  realPhotosMap: string | undefined,
): string | null {
  if (!realPhotosDir) return null;

  const map = loadMap(realPhotosMap);
  if (map && map[assetId]) {
    const mapped = path.join(realPhotosDir, map[assetId]!);
    if (fs.existsSync(mapped)) return mapped;
  }

  if (fs.existsSync(realPhotosDir)) {
    for (const ext of IMAGE_EXTENSIONS) {
      const candidate = path.join(realPhotosDir, `${assetId}${ext}`);
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  return null;
}
