import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const photosDir = path.resolve('fotos');
const widths = [480, 640, 960];
const skip = /logo-mm-parquet/;
const heroQuality = 50;
const defaultQuality = 68;

const files = (await readdir(photosDir)).filter((file) => file.toLowerCase().endsWith('.jpg') && !skip.test(file));

for (const file of files) {
  const filePath = path.join(photosDir, file);
  const source = await readFile(filePath);
  const metadata = await sharp(source).metadata();
  const quality = file.startsWith('hero-') ? heroQuality : defaultQuality;
  for (const width of widths) {
    if (metadata.width <= width) continue;
    const outPath = filePath.replace(/\.jpg$/i, `-${width}w.webp`);
    const buffer = await sharp(source).resize({ width }).webp({ quality }).toBuffer();
    await writeFile(outPath, buffer);
    console.log(`${file} -> ${width}w (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
}

const heroSource = await readFile(path.join(photosDir, 'hero-sergey.jpg'));
await writeFile(path.join(photosDir, 'hero-sergey.webp'), await sharp(heroSource).webp({ quality: heroQuality }).toBuffer());

const logo = await readFile(path.join(photosDir, 'logo-mm-parquet.png'));
await writeFile(path.join(photosDir, 'logo-mm-parquet-300.webp'), await sharp(logo).resize({ width: 300 }).webp({ quality: 76 }).toBuffer());
await writeFile(path.join(photosDir, 'logo-mm-parquet-300.png'), await sharp(logo).resize({ width: 300 }).png({ compressionLevel: 9 }).toBuffer());
console.log('logo-mm-parquet-300.webp/.png generados');
