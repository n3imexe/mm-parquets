import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const photosDir = path.resolve('fotos');
const widths = [480, 960];
const skip = /logo-mm-parquet/;

const files = (await readdir(photosDir)).filter((file) => file.toLowerCase().endsWith('.jpg') && !skip.test(file));

for (const file of files) {
  const filePath = path.join(photosDir, file);
  const source = await readFile(filePath);
  const metadata = await sharp(source).metadata();
  for (const width of widths) {
    if (metadata.width <= width) continue;
    const outPath = filePath.replace(/\.jpg$/i, `-${width}w.webp`);
    const buffer = await sharp(source).resize({ width }).webp({ quality: 72 }).toBuffer();
    await writeFile(outPath, buffer);
    console.log(`${file} -> ${width}w (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
}

const logo = await readFile(path.join(photosDir, 'logo-mm-parquet.png'));
await writeFile(path.join(photosDir, 'logo-mm-parquet-420.webp'), await sharp(logo).resize({ width: 420 }).webp({ quality: 85 }).toBuffer());
await writeFile(path.join(photosDir, 'logo-mm-parquet-420.png'), await sharp(logo).resize({ width: 420 }).png({ compressionLevel: 9 }).toBuffer());
console.log('logo-mm-parquet-420.webp/.png generados');
