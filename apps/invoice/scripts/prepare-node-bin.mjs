import { access, constants, copyFile, mkdir, realpath, chmod } from "node:fs/promises";
import path from "node:path";

const binDir = path.join(process.cwd(), "bin");
const dest = path.join(binDir, "node");

async function prepare() {
  const src = await realpath(process.execPath);
  await mkdir(binDir, { recursive: true });

  try {
    await access(dest, constants.F_OK);
    console.log("Node binary already bundled");
    return;
  } catch {
    // destination doesn't exist, proceed
  }

  await copyFile(src, dest);
  await chmod(dest, 0o755);
  console.log(`Bundled Node binary: ${src} -> ${dest}`);
}

prepare().catch((err) => {
  console.error("Failed to bundle Node binary:", err);
  process.exit(1);
});
