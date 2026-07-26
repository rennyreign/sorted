import fs from "fs"
import path from "path"

const root = process.cwd()
const manifestPath = path.join(root, "public/cms/studio-manifest.json")
const outputPath = path.join(root, "public/cms/studio-content.json")

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
const sections = manifest.pages.flatMap((page) => page.sections)

const content = {}

for (const section of sections) {
  const relativeFile = section.file.replace(/^\/content\//, "")
  const sourcePath = path.join(root, "content", relativeFile)

  try {
    content[section.id] = JSON.parse(fs.readFileSync(sourcePath, "utf8"))
  } catch (error) {
    content[section.id] = {
      _error: `Could not load ${section.file}: ${error.message}`,
    }
  }
}

fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), content }, null, 2)}\n`)
console.log(`Wrote ${path.relative(root, outputPath)} with ${sections.length} sections`)
