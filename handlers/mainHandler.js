import {
  getFavorites,
  getOrdersForUser,
  getRecentViews,
  setSession,
  clearSession,
} from "../services/storeService.js";
import { getProductById, searchProducts } from "../services/productService.js";
import {
  categoriesInlineKeyboard,
  mainMenuKeyboard,
} from "../utils/keyboards.js";
import { formatPrice } from "../utils/format.js";

function productShortLine(product) {
  const price = product.price?.["50ml"] ?? product.price?.["50g"] ?? product.price50;
  return `• <b>${product.name}</b> — ${formatPrice(price)}`;
}

function favoritesInline(products) {
  return {
    inline_keyboard: products.map((item) => [
      { text: `🌸 ${item.name}`, callback_data: `buy_${item.id}` },
    ]),
  };
}

export function createMainHandler({ bot, products, store }) {
  return {
    async handleStart(msg) {
      clearSession(store, msg.from.id);
      await bot.sendMessage(
        msg.chat.id,
        [
          "🖤 <b>Mushkuz.netlify.app</b> premium atirlar butikiga xush kelibsiz.",
          "Nafis hidlar, tez buyurtma, premium servis.",
        ].join("\n"),
        {
          parse_mode: "HTML",
          reply_markup: mainMenuKeyboard(),
        }
      );
    },

    async handleCallback(query) {
      const data = query.data || "";
      const chatId = query.message?.chat?.id;
      if (!chatId) {
        return false;
      }

      if (data === "menu_perfumes") {
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId, "Kategoriyani tanlang:", {
          reply_markup: categoriesInlineKeyboard(),
        });
        return true;
      }

      if (data === "back_main") {
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId, "Asosiy menyu:", {
          reply_markup: mainMenuKeyboard(),
        });
        return true;
      }

      if (data === "noop") {
        await bot.answerCallbackQuery(query.id);
        return true;
      }

      return false;
    },

    async handleMessage(msg) {
      const text = msg.text || "";
      const userId = msg.from.id;
      const chatId = msg.chat.id;
      const session = store.sessions.get(userId);

      if (text === "🛍 Perfumes") {
        await bot.sendMessage(chatId, "Kategoriyani tanlang:", {
          reply_markup: categoriesInlineKeyboard(),
        });
        return;
      }

      if (text === "🔥 Top Products") {
        const top = [...products]
          .sort((a, b) => {
            const bCount = store.analytics.productOrders.get(b.id) || 0;
            const aCount = store.analytics.productOrders.get(a.id) || 0;
            if (bCount !== aCount) {
              return bCount - aCount;
            }
            return Number(b.id) - Number(a.id);
          })
          .slice(0, 5);

        const message = [
          "🔥 <b>Top 5 Products</b>",
          ...top.map((item, index) => `${index + 1}. ${productShortLine(item)}`),
        ].join("\n");

        await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
        return;
      }

      if (text === "🔍 Search") {
        setSession(store, userId, { type: "search", step: "await_query" });
        await bot.sendMessage(chatId, "Qidiruv uchun nom kiriting (masalan: Sauvage):");
        return;
      }

      if (text === "📦 My Orders") {
        const orders = getOrdersForUser(store, userId).slice(0, 5);
        if (orders.length === 0) {
          await bot.sendMessage(chatId, "Sizda hozircha buyurtmalar yo'q.");
          return;
        }

        const body = orders
          .map(
            (item, idx) =>
              `${idx + 1}) ${item.productName} — ${item.size}\n📱 ${item.phone}\n📍 ${item.address}`
          )
          .join("\n\n");

        await bot.sendMessage(chatId, `📦 <b>Buyurtmalaringiz:</b>\n\n${body}`, {
          parse_mode: "HTML",
        });
        return;
      }

      if (text === "📞 Contact") {
        await bot.sendMessage(
          chatId,
          "📞 <b>Contact</b>\n☎️ +998 95 333 33 26\n💬 @zuba_6005",
          { parse_mode: "HTML" }
        );
        return;
      }

      if (text === "❤️ My Favorites") {
        const favorites = getFavorites(store, userId)
          .map((id) => getProductById(products, id))
          .filter(Boolean);

        if (favorites.length === 0) {
          await bot.sendMessage(chatId, "Sevimli mahsulotlar ro'yxati bo'sh.");
          return;
        }

        await bot.sendMessage(chatId, "❤️ <b>My Favorites</b>", {
          parse_mode: "HTML",
          reply_markup: favoritesInline(favorites.slice(0, 15)),
        });
        return;
      }

      if (text === "/recent") {
        const recent = getRecentViews(store, userId)
          .map((id) => getProductById(products, id))
          .filter(Boolean);

        if (recent.length === 0) {
          await bot.sendMessage(chatId, "Yaqinda ko'rilgan mahsulotlar yo'q.");
          return;
        }

        const body = recent
          .slice(0, 8)
          .map((item, idx) => `${idx + 1}. ${item.name}`)
          .join("\n");
        await bot.sendMessage(chatId, `🕘 Recently viewed:\n${body}`);
        return;
      }

      if (text === "/stats") {
        await bot.sendMessage(
          chatId,
          `📊 Orders count: <b>${store.analytics.totalOrders}</b>`,
          { parse_mode: "HTML" }
        );
        return;
      }

      if (session?.type === "search" && session.step === "await_query") {
        const matches = searchProducts(products, text, 10);
        clearSession(store, userId);

        if (matches.length === 0) {
          await bot.sendMessage(chatId, "Hech narsa topilmadi. Boshqa so'z bilan urinib ko'ring.");
          return;
        }

        await bot.sendMessage(chatId, `🔎 Topildi: ${matches.length} ta natija`, {
          reply_markup: {
            inline_keyboard: matches.map((item) => [
              { text: `🌸 ${item.name}`, callback_data: `prd_${item.id}_${item.category}_1` },
            ]),
          },
        });
        return;
      }
    },
  };
}
