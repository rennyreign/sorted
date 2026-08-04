const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = 'public/brand';
const FONT_CACHE_DIR = '.tmp/brand-fonts';
const PLUS_FONT_URL = 'https://raw.githubusercontent.com/tokotype/PlusJakartaSans/2.7.1/fonts/ttf/PlusJakartaSans-ExtraBold.ttf';
const PLUS_FONT_PATH = path.join(FONT_CACHE_DIR, 'PlusJakartaSans-ExtraBold.ttf');
const BAKESHOP_FONT_PATH = 'public/fonts/Bakeshop-Regular.ttf';

const fontSize = 86;
const tracking = -0.045 * fontSize; // matches main site tracking-[-0.045em]
const sortedX = 40;
const sortedY = 116;
const bakeshopY = sortedY - 0.06 * fontSize; // matches translate-y-[-0.06em]
const dotX = 295; // positioned after "Sorted" with -0.045em tracking
const opsX = 313; // positioned after period
const sitesX = 313; // positioned after period

const products = [
  { key: 'ops', label: 'ops', suffixX: opsX },
  { key: 'sites', label: 'sites', suffixX: sitesX },
];

const variants = [
  { key: 'light', bg: '#ffffff', sortedColor: '#070707', dotColor: '#dfff00', suffixColor: '#dfff00' },
  { key: 'dark', bg: '#070707', sortedColor: '#ffffff', dotColor: '#dfff00', suffixColor: '#dfff00' },
  { key: 'transparent', bg: null, sortedColor: '#070707', dotColor: '#dfff00', suffixColor: '#dfff00' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve();
      return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', reject);
  });
}

function buildSvg({ plusFont, bakeshopFont, label, suffixX, bg, sortedColor, dotColor, suffixColor }) {
  const bgRect = bg ? `<rect width="600" height="180" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180">
  <defs>
    <style>
      @font-face { font-family: 'PlusJakarta'; src: url('data:font/truetype;base64,${plusFont}'); font-weight: 800; }
      @font-face { font-family: 'Bakeshop'; src: url('data:font/truetype;base64,${bakeshopFont}'); }
    </style>
  </defs>
  ${bgRect}
  <text x="${sortedX}" y="${sortedY}" font-family="'PlusJakarta'" font-size="${fontSize}" font-weight="800" letter-spacing="${tracking}" fill="${sortedColor}">Sorted</text>
  <text x="${dotX}" y="${sortedY}" font-family="'PlusJakarta'" font-size="${fontSize}" font-weight="800" letter-spacing="0" fill="${dotColor}">.</text>
  <text x="${suffixX}" y="${bakeshopY}" font-family="'Bakeshop'" font-size="${fontSize}" fill="${suffixColor}">${label}</text>
</svg>`;
}

async function main() {
  await downloadFile(PLUS_FONT_URL, PLUS_FONT_PATH);

  const plusFont = fs.readFileSync(PLUS_FONT_PATH).toString('base64');
  const bakeshopFont = fs.readFileSync(BAKESHOP_FONT_PATH).toString('base64');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const product of products) {
    for (const variant of variants) {
      const svg = buildSvg({
        plusFont,
        bakeshopFont,
        label: product.label,
        suffixX: product.suffixX,
        bg: variant.bg,
        sortedColor: variant.sortedColor,
        dotColor: variant.dotColor,
        suffixColor: variant.suffixColor,
      });
      const filename = `sorted-${product.key}-wordmark-${variant.key}.png`;
      const outputPath = path.join(OUTPUT_DIR, filename);
      await sharp(Buffer.from(svg)).png().toFile(outputPath);
      console.log(`Generated ${outputPath}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
