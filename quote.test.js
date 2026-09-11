import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuoteMessage, buildWhatsAppUrl } from './quote.js';

const valid = { nombre: ' Anna ', poblacion: 'Barcelona', servicio: 'Instalación de parquet' };
test('prepares a trimmed Spanish quote with optional details', () => {
  const message = buildQuoteMessage({ ...valid, superficie: '85', mensaje: 'Roble & acabado mate' });
  assert.match(message, /Nombre: Anna\n/);
  assert.match(message, /85 m²/);
  assert.match(message, /Roble & acabado mate/);
});
test('omits empty optional fields', () => {
  const message = buildQuoteMessage(valid);
  assert.doesNotMatch(message, /Superficie|Mi proyecto/);
});
test('requires meaningful name, town and service', () => {
  for (const field of ['nombre', 'poblacion', 'servicio']) {
    assert.throws(() => buildQuoteMessage({ ...valid, [field]: '  ' }), /Completa/);
  }
});
test('rejects invalid areas', () => {
  for (const superficie of ['0', '-2', 'NaN', 'Infinity', '100001']) {
    assert.throws(() => buildQuoteMessage({ ...valid, superficie }), /superficie/);
  }
});
test('encodes special characters safely and uses the supplied phone', () => {
  const message = buildQuoteMessage({ ...valid, mensaje: '¿Roble? 50% & más #detalle' });
  const url = new URL(buildWhatsAppUrl(message));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/34678906586');
  assert.equal(url.searchParams.get('text'), message);
  assert.equal(url.hash, '');
});
test('limits the length of free text', () => {
  assert.match(buildQuoteMessage({ ...valid, mensaje: 'x'.repeat(1600) }), /Mi proyecto: x{1500}$/);
});
