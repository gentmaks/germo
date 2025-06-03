import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { transform } from '@svgr/core';

const svgLogo = `
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="#2563eb"/>
  <text x="50" y="65" font-family="Arial, sans-serif" font-size="45" font-weight="bold" fill="white" text-anchor="middle">G</text>
  <path d="M30 70 L70 70" stroke="white" stroke-width="4" stroke-linecap="round"/>
</svg>
`;

async function generateLogos() {
  const sizes = [
    { name: 'logo', size: 192 },
    { name: 'android-chrome-512x512', size: 512 }
  ];

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  for (const { name, size } of sizes) {
    await sharp(Buffer.from(svgLogo))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `${name}.png`));
  }

  console.log('Logo files generated successfully!');
}

generateLogos().catch(console.error); 