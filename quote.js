export function buildQuoteMessage(values) {
  const clean = (value, max = 1500) => String(value ?? '').trim().slice(0, max);
  const name = clean(values.nombre, 80);
  const town = clean(values.poblacion, 100);
  const service = clean(values.servicio, 100);
  if (!name || !town || !service) throw new Error('Completa tu nombre, población y servicio.');
  const area = clean(values.superficie, 10);
  if (area && (!Number.isFinite(Number(area)) || Number(area) < 1 || Number(area) > 100000)) {
    throw new Error('La superficie debe estar entre 1 y 100.000 m².');
  }
  return [
    'Hola, MM Parquet. Me gustaría consultar un presupuesto sin compromiso.',
    `Nombre: ${name}`,
    `Población: ${town}`,
    `Servicio: ${service}`,
    area ? `Superficie aproximada: ${area} m²` : '',
    clean(values.mensaje) ? `Mi proyecto: ${clean(values.mensaje)}` : '',
  ].filter(Boolean).join('\n');
}

export function buildWhatsAppUrl(message) {
  return `https://wa.me/34678906586?text=${encodeURIComponent(message)}`;
}
