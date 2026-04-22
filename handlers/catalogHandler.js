import {
  formatProductCaption,
  getProductById,
  paginateProducts,
} from "../services/productService.js";
import { addRecentView, toggleFavorite } from "../services/storeService.js";

function categoryName(category) {
  const labels = {
    bestseller: "Bestseller",
    premium: "Premium",
    budget: "Budget",
    arab: "Arab",
  };
  return labels[category] || category;
}

function catalogInlineKeyboard(category, page, totalPages, items) {
  const productRows = items.map((product) => [
    { text: `🌸 ${product.name}`, callback_data: `prd_${product.id}_${category}_${page}` },
  ]);

  const navRow = [
    { text: "⬅ Prev", callback_data: `cat_${category}_${Math.max(1, page - 1)}` },
    { text: `${page}/${totalPages}`, callback_data: "noop" },
    { text: "Next ➡", callback_data: `cat_${category}_${Math.min(totalPages, page + 1)}` },
  ];

  return {
    inline_keyboard: [...productRows, navRow, [{ text: "⬅ Back", callback_data: "menu_perfumes" }]],
  };
}

function productCardKeyboard(productId, category, page) {
  return {
    inline_keyboard: [
      [{ text: "👉 Buy", callback_data: `buy_${productId}` }],
      [{ text: "❤️ Add to Favorites", callback_data: `fav_${productId}` }],
      [{ text: "⬅ Back", callback_data: `cat_${category}_${page}` }],
    ],
  };
}

export function createCatalogHandler({ bot, products, store }) {
  async function showCategory(chatId, category, page = 1) {
    const filtered = products.filter((item) => item.category === category);
    const paged = paginateProducts(filtered, page, 8);
    const text = [
      `🛍 <b>${categoryName(category)} Collection</b>`,
      `<i>${paged.totalItems} ta mahsulot</i>`,
      "",
      "Quyidan atir tanlang:",
    ].join("\n");

    await bot.sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_markup: catalogInlineKeyboard(category, paged.page, paged.totalPages, paged.products),
    });
  }

  async function showProduct(chatId, userId, productId, category, page) {
    const product = getProductById(products, productId);
    if (!product) {
      await bot.sendMessage(chatId, "Mahsulot topilmadi.");
      return;
    }

    addRecentView(store, userId, productId);
    try {
      await bot.sendPhoto(chatId, product.image, {
        caption: formatProductCaption(product),
        parse_mode: "HTML",
        reply_markup: productCardKeyboard(product.id, category, page),
      });
    } catch (error) {
      await bot.sendMessage(
        chatId,
        `${formatProductCaption(product)}\n\n📷 Rasm vaqtincha ochilmadi.`,
        {
          parse_mode: "HTML",
          reply_markup: productCardKeyboard(product.id, category, page),
        }
      );
    }
  }

  return {
    showCategory,
    async handleCallback(query) {
      const data = query.data || "";
      const chatId = query.message?.chat?.id;
      const userId = query.from.id;
      if (!chatId) {
        return false;
      }

      if (data.startsWith("cat_")) {
        const [, category, rawPage] = data.split("_");
        await bot.answerCallbackQuery(query.id);
        await showCategory(chatId, category, Number(rawPage || "1"));
        return true;
      }

      if (data.startsWith("prd_")) {
        const [, rawProductId, category, rawPage] = data.split("_");
        await bot.answerCallbackQuery(query.id);
        await showProduct(chatId, userId, Number(rawProductId), category, Number(rawPage || "1"));
        return true;
      }

      if (data.startsWith("fav_")) {
        const [, rawProductId] = data.split("_");
        const isFavorite = toggleFavorite(store, userId, Number(rawProductId));
        await bot.answerCallbackQuery(query.id, {
          text: isFavorite ? "❤️ Sevimlilarga qo'shildi" : "💔 Sevimlilardan olib tashlandi",
        });
        return true;
      }

      return false;
    },
  };
}
