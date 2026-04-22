import fs from "fs/promises";
import { formatPrice, normalizeText } from "../utils/format.js";

export async function loadProducts(productsFilePath) {
  const raw = await fs.readFile(productsFilePath, "utf-8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("products.json must be a non-empty array");
  }

  return data.map((product) => ({
    ...product,
    normalizedName: normalizeText(product.name),
    category: String(product.category || "").toLowerCase(),
  }));
}

export function getProductById(products, productId) {
  return products.find((item) => item.id === productId);
}

export function getProductPrices(product) {
  return {
    "10ml": product.price10 ?? product.price?.["10ml"] ?? product.price?.["10g"],
    "50ml": product.price50 ?? product.price?.["50ml"] ?? product.price?.["50g"],
    "100ml": product.price100 ?? product.price?.["100ml"] ?? product.price?.["100g"],
  };
}

export function formatProductCaption(product) {
  const prices = getProductPrices(product);
  return [
    `🌸 <b>${product.name}</b>`,
    "",
    `10ml — <b>${formatPrice(prices["10ml"])}</b>`,
    `50ml — <b>${formatPrice(prices["50ml"])}</b>`,
    `100ml — <b>${formatPrice(prices["100ml"])}</b>`,
    "",
    `🖤 ${product.description || "Premium quality fragrance."}`,
  ].join("\n");
}

export function searchProducts(products, query, limit = 10) {
  const q = normalizeText(query);
  if (!q) {
    return [];
  }

  return products
    .filter(
      (item) =>
        item.normalizedName.includes(q) ||
        normalizeText(item.description).includes(q)
    )
    .slice(0, limit);
}

export function paginateProducts(products, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const boundedPage = Math.min(Math.max(page, 1), totalPages);
  const start = (boundedPage - 1) * pageSize;
  const pagedProducts = products.slice(start, start + pageSize);

  return {
    products: pagedProducts,
    page: boundedPage,
    totalPages,
    totalItems: products.length,
  };
}
