import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Crear el SVG del ícono directamente
const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#25D366"/>
      <stop offset="100%" style="stop-color:#128C7E"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <g transform="translate(256, 256)">
    <!-- Phone handset icon -->
    <path d="M-60 -120 L-60 -60 L-30 -60 L-15 -30 L15 -30 L30 -60 L60 -60 L60 -120 Z" fill="white" opacity="0.3"/>
    <path d="M-80 -80 L-80 -20 L-50 -20 L-20 20 L20 20 L50 -20 L80 -20 L80 -80 L120 -80 L120 40 C120 80 100 100 60 120 L20 140 L-20 140 L-60 120 C-100 100 -120 80 -120 40 L-120 -80 Z" fill="white"/>
  </g>
</svg>`;

const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = join(publicDir, `icon-${size}.png`);
    
    await sharp(Buffer.from(iconSVG), { density: 72 })
      .resize(size, size, { fit: 'contain', background: { r: 18, g: 140, b: 126, alpha: 1 } })
      .png({ quality: 100 })
      .toFile(outputPath);
    
    console.log(`✅ Generado: icon-${size}.png`);
  }
  
  console.log('\n🎉 Todos los íconos generados correctamente');
}

generateIcons().catch(err => {
  console.error('❌ Error generando íconos:', err.message);
  process.exit(1);
});
