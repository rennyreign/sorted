const sharp = require('sharp');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180">
  <rect width="600" height="180" fill="white"/>
  <text x="40" y="116" font-family="'System Font', -apple-system" font-size="86" font-weight="800" letter-spacing="-3.87" fill="#070707">Sorted</text>
</svg>`;
sharp(Buffer.from(svg)).png().toFile('/tmp/test-sf.png').then(() => console.log('OK')).catch(e => console.error(e));
