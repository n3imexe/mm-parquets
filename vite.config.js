import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = process.cwd();
const pages = ['index', 'galeria', 'servicios/index', 'trabajos/index', 'acabados/index', 'sobre-mm-parquet/index', 'preguntas-frecuentes/index', 'contacto/index'];

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

export default defineConfig({
  appType: 'mpa',
  plugins: [partials()],
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
