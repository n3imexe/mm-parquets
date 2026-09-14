import { readFileSync, readdirSync, readFileSync as rf, writeFileSync, unlinkSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { defineConfig } from 'vite';

const root = process.cwd();
const pages = ['index', 'galeria', 'servicios/index', 'trabajos/index', 'acabados/index', 'sobre-mm-parquet/index', 'preguntas-frecuentes/index', 'contacto/index', '404'];

function partials() {
  return {
    name: 'mm-parquet-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!--@include\s+([\w./-]+)\s*-->/g, (_, file) => readFileSync(resolve(root, file), 'utf8'));
      },
    },
  };
}

function inlineCss() {
  return {
    name: 'mm-parquet-inline-css',
    apply: 'build',
    closeBundle() {
      const dist = resolve(root, 'dist');
      const assetsDir = join(dist, 'assets');
      const cssFile = readdirSync(assetsDir).find((file) => file.endsWith('.css'));
      if (!cssFile) return;
      const css = readFileSync(join(assetsDir, cssFile), 'utf8');
      const htmlFiles = ['index.html', '404.html', 'galeria.html', 'servicios/index.html', 'trabajos/index.html', 'acabados/index.html', 'sobre-mm-parquet/index.html', 'preguntas-frecuentes/index.html', 'contacto/index.html'];
      for (const file of htmlFiles) {
        const filePath = join(dist, file);
        const html = readFileSync(filePath, 'utf8');
        writeFileSync(filePath, html.replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${css}</style>`));
      }
      unlinkSync(join(assetsDir, cssFile));
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [partials(), inlineCss()],
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replace('/index', '') || 'index', resolve(root, `${page}.html`)])),
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
