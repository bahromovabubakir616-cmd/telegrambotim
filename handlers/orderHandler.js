import { getProductById } from "../services/productService.js";
import {
  addOrderForUser,
  clearSession,
  getSession,
  setSession,
} from "../services/storeService.js";
import {
  contactRequestKeyboard,
  mainMenuKeyboard,
  removeKeyboard,
} from "../utils/keyboards.js";

function sizeKeyboard(productId) {
  return {
    inline_keyboard: [
      [{ text: "10ml", callback_data: `size_${productId}_10ml` }],
      [{ text: "50ml", callback_data: `size_${productId}_50ml` }],
      [{ text: "100ml", callback_data: `size_${productId}_100ml` }],
      [{ text: "❌ Cancel", callback_data: "order_cancel" }],
    ],
  };
}

function isPhoneValid(phone) {
  return /^[+\d][\d\s\-()]{8,}$/.test(phone);
}

export function createOrderHandler({ bot, products, store, orderService }) {
  return {
    async handleCallback(query) {
      const data = query.data || "";
      const chatId = query.message?.chat?.id;
      const userId = query.from.id;
      if (!chatId) {
        return false;
      }

      if (data.startsWith("buy_")) {
        const productId = Number(data.replace("buy_", ""));
        const product = getProductById(products, productId);
        await bot.answerCallbackQuery(query.id);

        if (!product) {
          await bot.sendMessage(chatId, "Mahsulot topilmadi.");
          return true;
        }

        setSession(store, userId, {
          type: "order",
          step: "size",
          productId,
          size: "",
          customerName: "",
          phone: "",
          address: "",
        });

        await bot.sendMessage(chatId, `📦 <b>${product.name}</b> uchun hajmni tanlang:`, {
          parse_mode: "HTML",
          reply_markup: sizeKeyboard(product.id),
        });
        return true;
      }

      if (data.startsWith("size_")) {
        const [, rawProductId, size] = data.split("_");
        const session = getSession(store, userId);
        await bot.answerCallbackQuery(query.id);

        if (!session || session.type !== "order") {
          await bot.sendMessage(chatId, "Buyurtmani qayta boshlang.");
          return true;
        }

        session.productId = Number(rawProductId);
        session.size = size;
        session.step = "name";
        setSession(store, userId, session);

        await bot.sendMessage(chatId, "👤 Ismingizni kiriting:", {
          reply_markup: removeKeyboard(),
        });
        return true;
      }

      if (data === "order_cancel") {
        clearSession(store, userId);
        await bot.answerCallbackQuery(query.id, { text: "Bekor qilindi." });
        await bot.sendMessage(chatId, "Buyurtma bekor qilindi.", {
          reply_markup: mainMenuKeyboard(),
        });
        return true;
      }

      return false;
    },

    async handleMessage(msg) {
      const userId = msg.from.id;
      const chatId = msg.chat.id;
      const session = getSession(store, userId);

      if (!session || session.type !== "order") {
        return false;
      }

      if (msg.text === "❌ Cancel") {
        clearSession(store, userId);
        await bot.sendMessage(chatId, "Buyurtma bekor qilindi.", {
          reply_markup: mainMenuKeyboard(),
        });
        return true;
      }

      if (session.step === "name") {
        const name = (msg.text || "").trim();
        if (name.length < 2) {
          await bot.sendMessage(chatId, "Ism kamida 2 ta belgidan iborat bo'lsin.");
          return true;
        }

        session.customerName = name;
        session.step = "phone";
        setSession(store, userId, session);
        await bot.sendMessage(chatId, "📱 Telefon raqamingizni yuboring:", {
          reply_markup: contactRequestKeyboard(),
        });
        return true;
      }

      if (session.step === "phone") {
        const phone = msg.contact?.phone_number || msg.text || "";
        if (!isPhoneValid(phone)) {
          await bot.sendMessage(
            chatId,
            "Telefon formati noto'g'ri. Tugma orqali yuboring yoki +998901234567 ko'rinishida kiriting."
          );
          return true;
        }

        session.phone = phone.trim();
        session.step = "address";
        setSession(store, userId, session);
        await bot.sendMessage(chatId, "📍 Yetkazib berish manzilini kiriting:", {
          reply_markup: removeKeyboard(),
        });
        return true;
      }

      if (session.step === "address") {
        const address = (msg.text || "").trim();
        if (address.length < 6) {
          await bot.sendMessage(chatId, "Manzilni to'liqroq kiriting.");
          return true;
        }

        const product = getProductById(products, session.productId);
        if (!product) {
          clearSession(store, userId);
          await bot.sendMessage(chatId, "Mahsulot topilmadi. Qayta urinib ko'ring.");
          return true;
        }

        const order = {
          productId: product.id,
          productName: product.name,
          size: session.size,
          customerName: session.customerName,
          phone: session.phone,
          address,
          userId,
          createdAt: new Date().toISOString(),
        };

        try {
          await orderService.dispatchOrder(bot, order);
        } catch (error) {
          console.error("Order dispatch failed:", error.message);
        }

        addOrderForUser(store, userId, order);
        clearSession(store, userId);

        await bot.sendMessage(
          chatId,
          "✅ Buyurtmangiz qabul qilindi. Menejerimiz tez orada siz bilan bog'lanadi.",
          { reply_markup: mainMenuKeyboard() }
        );
        return true;
      }

      return false;
    },
  };
}
