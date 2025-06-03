import sharp from 'sharp';
import path from 'path';

async function generateNoise() {
  const width = 400;
  const height = 400;
  const channels = 4; // RGBA
  const noise = Buffer.alloc(width * height * channels);

  // Generate noise
  for (let i = 0; i < noise.length; i += channels) {
    const value = Math.floor(Math.random() * 255);
    noise[i] = value;     // R
    noise[i + 1] = value; // G
    noise[i + 2] = value; // B
    noise[i + 3] = 25;    // A (10% opacity)
  }

  await sharp(noise, {
    raw: {
      width,
      height,
      channels
    }
  })
  .png()
  .toFile(path.join(process.cwd(), 'public', 'noise.png'));

  console.log('Noise texture generated successfully!');
}

generateNoise().catch(console.error); 