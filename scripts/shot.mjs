import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const routes = ['', 'servicios/', 'trabajos/', 'acabados/', 'sobre-mm-parquet/', 'preguntas-frecuentes/', 'contacto/'];
for (const route of routes) {
  await page.goto(`http://127.0.0.1:5173/${route}`, { waitUntil: 'networkidle' });
  const banner = page.locator('#cookie-banner');
  if (await banner.isVisible().catch(() => false)) {
    await page.locator('#cookie-banner [data-cookie-decline]').click();
  }
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  const name = route ? route.replace(/\//g, '') : 'home';
  await page.screenshot({ path: `check-${name}.png`, fullPage: true });
}
await browser.close();
console.log('done');
