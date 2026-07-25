import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

const root = process.cwd()
const templateRoot = join(root, "templates", "sorted-studio")
const registryPath = join(root, "clients", "sites.json")

const args = process.argv.slice(2)

function arg(name, fallback = "") {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] || fallback : fallback
}

function hasFlag(name) {
  return args.includes(`--${name}`)
}

function usage() {
  console.log(`Usage:
  node scripts/upgrade-sorted-studio.mjs --target ../client-repo [--slug client-slug]

Options:
  --slug               Look up client name/domain/path in clients/sites.json
  --target             Client repo path. Required unless registry localPath is set.
  --client-name        Overrides registry client name
  --client-domain      Overrides registry client domain
  --initial            Overrides registry initial
  --overwrite-manifest Replace public/cms/studio-manifest.json
  --dry-run            Print actions without writing
`)
}

if (hasFlag("help") || hasFlag("h")) {
  usage()
  process.exit(0)
}

function readRegistry(slug) {
  if (!slug || !existsSync(registryPath)) return null
  const sites = JSON.parse(readFileSync(registryPath, "utf8"))
  return sites.find((site) => site.slug === slug) || null
}

const slug = arg("slug")
const site = readRegistry(slug)
const target = resolve(root, arg("target", site?.localPath || ""))

if (!target || target === root) {
  usage()
  throw new Error("Missing --target and no registry localPath found")
}

const clientName = arg("client-name", site?.name || "Client Site")
const clientDomain = arg("client-domain", site?.domain || "")
const clientInitial = arg("initial", site?.initial || clientName.charAt(0).toUpperCase())
const dryRun = hasFlag("dry-run")
const overwriteManifest = hasFlag("overwrite-manifest")
const version = readFileSync(join(templateRoot, "VERSION"), "utf8").trim()

function replaceTokens(source) {
  return source
    .replaceAll("__CLIENT_NAME__", clientName)
    .replaceAll("__CLIENT_DOMAIN__", clientDomain)
    .replaceAll("__CLIENT_INITIAL__", clientInitial)
}

function writeFileFromTemplate(relativePath, options = {}) {
  const sourcePath = join(templateRoot, relativePath)
  const targetPath = join(target, relativePath)
  const exists = existsSync(targetPath)
  if (exists && options.preserve) {
    console.log(`preserve ${relativePath}`)
    return
  }
  console.log(`${dryRun ? "would write" : "write"} ${relativePath}`)
  if (dryRun) return
  mkdirSync(dirname(targetPath), { recursive: true })
  const content = readFileSync(sourcePath, "utf8")
  writeFileSync(targetPath, replaceTokens(content))
}

function copyTemplate(relativePath) {
  const sourcePath = join(templateRoot, relativePath)
  const targetPath = join(target, relativePath)
  console.log(`${dryRun ? "would copy" : "copy"} ${relativePath}`)
  if (dryRun) return
  mkdirSync(dirname(targetPath), { recursive: true })
  copyFileSync(sourcePath, targetPath)
}

function writeContent(relativePath, content) {
  const targetPath = join(target, relativePath)
  console.log(`${dryRun ? "would write" : "write"} ${relativePath}`)
  if (dryRun) return
  mkdirSync(dirname(targetPath), { recursive: true })
  writeFileSync(targetPath, content)
}

function patchPackageJson() {
  const packagePath = join(target, "package.json")
  if (!existsSync(packagePath)) {
    console.log("skip package.json patch; file not found")
    return
  }
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"))
  pkg.scripts ||= {}
  const build = pkg.scripts.build || "next build"
  if (!build.includes("build-studio-content.mjs")) {
    pkg.scripts.build = build.includes("next build")
      ? build.replace("next build", "node scripts/build-studio-content.mjs && next build")
      : `node scripts/build-studio-content.mjs && ${build}`
  }
  pkg.scripts.cms ||= "npx decap-server"
  pkg.devDependencies ||= {}
  pkg.devDependencies["decap-server"] ||= "^3.7.0"
  pkg.sortedStudio ||= {}
  pkg.sortedStudio.version = version
  pkg.sortedStudio.source = "templates/sorted-studio"
  console.log(`${dryRun ? "would patch" : "patch"} package.json`)
  if (!dryRun) writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
}

writeFileFromTemplate("public/cms/index.html")
writeFileFromTemplate("public/cms/decap.html")
copyTemplate("public/cms/studio.css")
copyTemplate("public/cms/studio.js")
copyTemplate("scripts/build-studio-content.mjs")

const manifestTarget = join(target, "public", "cms", "studio-manifest.json")
if (overwriteManifest || !existsSync(manifestTarget)) {
  writeContent(
    "public/cms/studio-manifest.json",
    replaceTokens(readFileSync(join(templateRoot, "public/cms/studio-manifest.example.json"), "utf8")),
  )
} else {
  console.log("preserve public/cms/studio-manifest.json")
}

patchPackageJson()

console.log(`Sorted Studio ${version} upgrade prepared for ${clientName}`)
