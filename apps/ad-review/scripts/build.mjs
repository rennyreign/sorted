import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'

await mkdir('dist', { recursive: true })
await cp('public', 'dist', { recursive: true })
// Host/CDN defaults cache JS and CSS for a week. Every entry point must request
// the same content-derived release, including the imported editor module/styles.
const assets = await Promise.all(['app.js','styles.css','image-editor.js','image-editor.css'].map(file => readFile(`public/${file}`)))
const version = createHash('sha256').update(Buffer.concat(assets)).digest('hex').slice(0,16)
async function versionEntries(directory) {
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) await versionEntries(path)
    else if (/\.(html|php)$/.test(entry.name)) {
      const source = await readFile(path,'utf8')
      const next = source.replace(/\/app\.js(?:\?v=[^"]*)?"/g, `/app.js?v=${version}"`).replace(/\/styles\.css(?:\?v=[^"]*)?"/g, `/styles.css?v=${version}"`)
      if (next !== source) await writeFile(path,next)
    }
  }
}
await versionEntries('dist')
console.log('Ad previewer built to dist/')
