import { readFile, writeFile } from 'node:fs/promises';

// Anade/actualiza srcset responsive (480w/640w/960w) y sizes segun el contenedor de cada
// <source type="image/webp">. Recorre el HTML linea a linea siguiendo la pila de clases de
// los contenedores abiertos. Es idempotente: puede relanzarse sobre HTML ya procesado.

const files = ['index.html', 'trabajos/index.html', 'servicios/index.html', 'acabados/index.html', 'sobre-mm-parquet/index.html', 'contacto/index.html', 'preguntas-frecuentes/index.html'];

const CONTEXT_SIZES = [
  { match: 'hero', sizes: '100vw' },
  { match: 'project-thumbnails', sizes: '150px' },
  { match: 'project-feature', sizes: '(max-width: 800px) 100vw, 620px' },
  { match: 'service-photo', sizes: '(max-width: 800px) calc(88vw - 56px), 400px' },
  { match: 'sample-carousel', sizes: '(max-width: 800px) 60vw, 320px' },
  { match: 'work-mosaic', sizes: '(max-width: 800px) 50vw, 360px' },
  { match: 'compare-table', sizes: '(max-width: 800px) 50vw, 480px' },
  { match: 'compare-slider', sizes: '(max-width: 800px) calc(88vw - 56px), 400px' },
  { match: 'visually-hidden', skip: true }, // galeria oculta: se carga entera al abrir el visor
  { match: 'material-display', sizes: '(max-width: 800px) 100vw, 640px' },
];
const DEFAULT_SIZES = '(max-width: 800px) 100vw, 640px';

const TAG_RE = /<\/?[a-zA-Z][^>]*>/g;

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const lines = html.split('\n');
  const stack = [];
  let changed = 0;

  const out = lines.map((line) => {
    // Actualiza la pila de contexto procesando las etiquetas de apertura/cierre de la linea
    const tags = line.match(TAG_RE) || [];
    let result = line;

    for (const tag of tags) {
      const isClose = tag.startsWith('</');
      const name = tag.match(/^<\/?([a-zA-Z]+)/)[1].toLowerCase();
      if (!isClose) {
        const classMatch = tag.match(/class="([^"]+)"/);
        stack.push(classMatch ? classMatch[1] : '');
        if (tag.includes('type="image/webp"')) {
          const srcsetMatch = tag.match(/srcset="([^"]+)"/);
          const firstUrl = srcsetMatch ? srcsetMatch[1].split(',')[0].trim().split(' ')[0] : null;
          const fileMatch = firstUrl ? firstUrl.match(/^\/fotos\/(.+?)(?:-(?:480|640|960)w)?\.webp$/) : null;
          if (fileMatch) {
            const ctx = stack.filter(Boolean).join(' ');
            const rule = CONTEXT_SIZES.find((r) => ctx.includes(r.match));
            if (!rule?.skip) {
              const sizes = rule ? rule.sizes : DEFAULT_SIZES;
              const base = fileMatch[1];
              let newTag = tag.replace(/srcset="[^"]+"/, `srcset="/fotos/${base}-480w.webp 480w, /fotos/${base}-640w.webp 640w, /fotos/${base}-960w.webp 960w, /fotos/${base}.webp 1440w"`);
              newTag = newTag.includes('sizes=') ? newTag.replace(/sizes="[^"]*"/, `sizes="${sizes}"`) : newTag.replace(/srcset="[^"]+"/, (m) => `${m} sizes="${sizes}"`);
              result = result.replace(tag, newTag);
              changed++;
            }
          }
          // <source> es void, no queda en la pila
          stack.pop();
        } else if (/\/>$/.test(tag.trim()) || ['img', 'br', 'input', 'meta', 'link', 'hr', 'source'].includes(name)) {
          stack.pop(); // elemento void o auto-cerrado
        }
      } else {
        // buscar el abierto correspondiente desde arriba
        for (let i = stack.length - 1; i >= 0; i--) {
          stack.splice(i, 1);
          break;
        }
      }
    }
    return result;
  });

  if (changed) await writeFile(file, out.join('\n'));
  console.log(`${file}: ${changed} sources actualizados`);
}
