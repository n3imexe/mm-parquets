import sharp from 'sharp';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const writeWithRetry = async (filePath, buffer, attempts = 15) => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      await writeFile(filePath, buffer);
      return;
    } catch (error) {
      if (attempt === attempts - 1) throw error;
      await wait(500);
    }
  }
};

const photosDir = path.resolve('fotos');
const files = (await readdir(photosDir)).filter((file) => file.toLowerCase().endsWith('.jpg'));

let savedTotal = 0;
let webpTotal = 0;
for (const file of files) {
  const filePath = path.join(photosDir, file);
  const sourceBuffer = await readFile(filePath);
  const before = sourceBuffer.length;
  const image = sharp(sourceBuffer);
  const metadata = await image.metadata();
  
  // Hero: max 1600px wide. Other photos: max 1440px.
  const isHero = file.startsWith('hero-');
  const maxWidth = isHero ? 1600 : 1440;
  const pipeline = metadata.width > maxWidth ? image.resize({ width: maxWidth }) : image;
  
  // JPEG: quality 72 for photos, 65 for hero
  const jpegQuality = isHero ? 65 : 72;
  const buffer = await pipeline.jpeg({ quality: jpegQuality, mozjpeg: true }).toBuffer();
  if (buffer.length < before) {
    try {
      await writeWithRetry(filePath, buffer);
      const after = buffer.length;
      savedTotal += before - after;
      console.log(`${file}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
    } catch (error) {
      console.log(`${file}: omitido (archivo bloqueado) — ${error.message}`);
    }
  } else {
    console.log(`${file}: ya optimizado (${(before / 1024).toFixed(0)} KB)`);
  }

  // WebP: quality 70 for photos, 62 for hero
  const webpQuality = isHero ? 62 : 70;
  const webpPipeline = metadata.width > maxWidth ? sharp(sourceBuffer).resize({ width: maxWidth }) : sharp(sourceBuffer);
  const webpBuffer = await webpPipeline.webp({ quality: webpQuality }).toBuffer();
  await writeWithRetry(filePath.replace(/\.jpg$/i, '.webp'), webpBuffer);
  webpTotal += webpBuffer.length;
  console.log(`${file}: webp generado (${(webpBuffer.length / 1024).toFixed(0)} KB)`);
  await wait(200);
}
console.log(`\nAhorro total JPEG: ${(savedTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Peso total WebP generado: ${(webpTotal / 1024 / 1024).toFixed(2)} MB`);
