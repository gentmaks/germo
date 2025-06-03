import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function generateFavicons() {
  const publicDir = path.join(process.cwd(), 'public');
  const faviconDir = path.join(publicDir, 'favicon');
  const logoPath = path.join(faviconDir, 'logo.png');

  // Ensure the favicon directory exists
  if (!fs.existsSync(faviconDir)) {
    fs.mkdirSync(faviconDir, { recursive: true });
  }

  // Define the sizes we need
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  // Generate PNGs for each size
  for (const { name, size } of sizes) {
    await sharp(logoPath)
      .resize(size, size)
      .png()
      .toFile(path.join(faviconDir, name));
  }

  // Generate ICO file (includes 16x16, 32x32, and 48x48)
  const icoSizes = [16, 32, 48];
  const icoBuffers = await Promise.all(
    icoSizes.map(size =>
      sharp(logoPath)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // Use the first buffer as the favicon.ico
  await sharp(icoBuffers[0])
    .toFile(path.join(faviconDir, 'favicon.ico'));

  console.log('Favicons generated successfully!');
}

generateFavicons().catch(console.error); 