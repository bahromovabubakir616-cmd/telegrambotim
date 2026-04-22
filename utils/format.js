export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function formatPrice(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return "Narx yo'q";
  }
  return `${numeric.toLocaleString("uz-UZ")} so'm`;
}

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}
