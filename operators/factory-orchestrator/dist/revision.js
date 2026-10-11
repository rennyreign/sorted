// ─────────────────────────────────────────────────────────────
// Source Revision Fingerprint
//
// Deterministic SHA256 over the site source tree:
//   for each file (sorted by POSIX relative path):
//     hash.update(relpath + '\0' + rawBytes + '\0')
//
// Covered roots (inside the build/site directory):
//   directories: app, components, lib, public, content, scripts
//   top-level files: package.json, next.config.mjs,
//                    postcss.config.mjs, tsconfig.json
//
// Missing directories are simply absent. Excluded everywhere:
// node_modules, out, .next, input, artifacts, state, logs, any
// .env*, and hidden entries. Symlinks inside covered roots are a
// hard error — site source must be regular files.
//
// This interface is imported by the job ledger (dist/revision.js);
// keep `fingerprintSource(buildDir): string` stable.
// ─────────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
const SOURCE_DIRS = ['app', 'components', 'lib', 'public', 'content', 'scripts'];
const SOURCE_FILES = [
    'package.json',
    'package-lock.json',
    'pnpm-lock.yaml',
    'next.config.mjs',
    'postcss.config.mjs',
    'tsconfig.json',
    'eslint.config.mjs',
];
const EXCLUDED_DIRS = new Set([
    'node_modules',
    'out',
    '.next',
    'input',
    'artifacts',
    'state',
    'logs',
]);
function isExcludedName(name) {
    if (name.startsWith('.'))
        return true; // hidden entries, .next, .env*
    if (name === '.env' || name.startsWith('.env'))
        return true;
    return false;
}
function walk(dir, root, out) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (isExcludedName(entry.name))
            continue;
        if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name))
            continue;
        const abs = path.join(dir, entry.name);
        if (entry.isSymbolicLink()) {
            throw new Error(`Symlink in source tree is not allowed: ${abs}`);
        }
        if (entry.isDirectory()) {
            walk(abs, root, out);
        }
        else if (entry.isFile()) {
            out.push(path.relative(root, abs).split(path.sep).join('/'));
        }
    }
}
export function fingerprintSource(buildDir) {
    const root = path.resolve(buildDir);
    const relPaths = [];
    for (const dir of SOURCE_DIRS) {
        const abs = path.join(root, dir);
        if (fs.existsSync(abs)) {
            const stat = fs.lstatSync(abs);
            if (stat.isSymbolicLink()) {
                throw new Error(`Symlink in source tree is not allowed: ${abs}`);
            }
            if (stat.isDirectory())
                walk(abs, root, relPaths);
        }
    }
    for (const file of SOURCE_FILES) {
        const abs = path.join(root, file);
        if (fs.existsSync(abs)) {
            const stat = fs.lstatSync(abs);
            if (stat.isSymbolicLink()) {
                throw new Error(`Symlink in source tree is not allowed: ${abs}`);
            }
            if (stat.isFile())
                relPaths.push(file);
        }
    }
    relPaths.sort();
    const hash = crypto.createHash('sha256');
    for (const rel of relPaths) {
        hash.update(rel);
        hash.update('\0');
        hash.update(fs.readFileSync(path.join(root, rel)));
        hash.update('\0');
    }
    return hash.digest('hex');
}
