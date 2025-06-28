export default function sanitizeFilename(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina diacriticele
    .replace(/[^\w\s-]/g, "") // elimina caracterele speciale
    .replace(/\s+/g, "-") // spatii - liniuta
    .toLowerCase();
}
