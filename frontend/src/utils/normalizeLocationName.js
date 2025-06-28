function normalizeLocationName(city) {
  if (!city || typeof city !== 'string') return '';
  
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .split(' ')
    .join('') 
    .trim();
}

export { normalizeLocationName };
