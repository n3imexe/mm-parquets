# MM Parquet

- Web en español para MM Parquet, empresa de parquet de Barcelona. Estética cálida de madera, nogal y arena.
- Stack: Vite con HTML, CSS y JavaScript nativo. Tipografías locales con Fontsource. No hay backend.
- Arquitectura multipágina de 8 rutas con parciales compartidos (head, header, footer) inyectados por un plugin de Vite: `/`, `/galeria.html`, `/servicios/`, `/trabajos/`, `/acabados/`, `/sobre-mm-parquet/`, `/preguntas-frecuentes/` y `/contacto/`.
- `npm run dev -- --port 5173` inicia la web en http://127.0.0.1:5173.
- `npm run build` genera la web de producción en `dist`.
- `npm test` ejecuta las pruebas unitarias de preparación de presupuestos.
- Con el servidor de desarrollo activo, `node verify.mjs` recorre las 7 rutas y comprueba parciales inyectados, enlaces internos y anclajes, imágenes locales, nueve anchos de pantalla, legibilidad, accesibilidad automatizada con Playwright y axe, y varias interacciones (menú móvil, comparador antes/después, visor de trabajos, selector de tonos, acordeón de preguntas y formulario de presupuesto). Genera `preview-desktop.png` y `preview-mobile.png`.
- Preferencias del usuario: copy directo, no poético; enfoque equilibrado en viviendas, locales y oficinas. Sin sección de galería «Ideas para habitar mejor». Tipografía DM Sans con títulos en peso 600 y texto principal y campos de formulario de al menos 16 px. Diseño editorial tranquilo: mucho espacio en blanco, fotografía real, bordes finos, sin gradientes, glassmorphism, blobs, sombras exageradas ni tipografía comercial excesiva. La web debe parecer empresa de parquet, no landing page de conversión.
- La verificación usa Microsoft Edge instalado en Windows. Se puede elegir otro canal con la variable `BROWSER_CHANNEL`.
- El formulario solo prepara un enlace de WhatsApp. El visitante debe abrirlo, revisar el mensaje y enviarlo; no simular envíos ni almacenar datos personales.
- Datos de contacto aportados en las referencias: +34 678 906 586 e info@mmparquet.com. Confirmarlos antes de publicar.
- Las imágenes se sirven localmente desde `fotos/` y Vite las incorpora al build. El grupo actual incluye fotografías reales de: restauración (antes/después), instalación, exterior/piscina, escaleras, muebles/carpintería a medida y 5 fotos de muestrarios (prefijos 625/626). No duplicar ni inventar imágenes como obras distintas.
- No reintroducir menciones de cobertura geográfica en la página. La página `/acabados/` mantiene el selector de tres tonos (roble natural, nogal cálido, roble claro) con navegación por teclado; las fotografías de muestrarios se muestran como libreta de muestras reales y no se asocian a especies o referencias sin confirmación.
- No inventar reseñas, certificaciones, cifras ni antigüedad. La página `/trabajos/` muestra la obra real con un visor de fotografía, miniaturas, flechas de teclado y Escape; no volver a una galería genérica de inspiración.
- `TEST_URL=http://127.0.0.1:4173` permite ejecutar `node verify.mjs` contra `npm run preview -- --port 4173` para comprobar el build y sus fotografías.
- Trayectoria confirmada por el usuario: más de 23 años en el parquet, 16 de ellos en una empresa de referencia del sector (no nombrarla en la web). No hace puertas ni cocinas. Servicios: instalación natural/sintética (flotante y encolada; espiga, punta de Hungría, lama), restauración, pulido/barnizado/aceitado y limpieza, tarimas de exterior, escaleras y carpintería a medida vinculada al suelo. El copy toma como referencia de tono frparquets.com y seroparquet.com.
- La captura móvil de `verify.mjs` se recorta a 16 384 px porque Chromium no captura páginas más altas; la página a 390 px supera ese límite.
- Antes del lanzamiento comercial, completar titular, NIF/CIF, domicilio y política de privacidad con los datos y procesos reales de la empresa. Los diálogos legales señalan estos pendientes.
