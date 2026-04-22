import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { buildConfig } from "./utils/config.js";
import { loadProducts } from "./services/productService.js";
import { createStore } from "./services/storeService.js";
import { createOrderService } from "./services/orderService.js";
import { createCatalogHandler } from "./handlers/catalogHandler.js";
import { createOrderHandler } from "./handlers/orderHandler.js";
import { createMainHandler } from "./handlers/mainHandler.js";

const config = buildConfig();
const products = await loadProducts(config.productsFilePath);
const bot = new TelegramBot(config.botToken, { polling: true });

const store = createStore();
const orderService = createOrderService(config);
const catalogHandler = createCatalogHandler({ bot, products, store });
const orderHandler = createOrderHandler({ bot, products, store, orderService });
const mainHandler = createMainHandler({ bot, products, store });

bot.onText(/\/start/, async (msg) => {
  await mainHandler.handleStart(msg);
});

bot.on("callback_query", async (query) => {
  try {
    const handledByMain = await mainHandler.handleCallback(query);
    if (handledByMain) {
      return;
    }

    const handledByCatalog = await catalogHandler.handleCallback(query);
    if (handledByCatalog) {
      return;
    }

    const handledByOrder = await orderHandler.handleCallback(query);
    if (handledByOrder) {
      return;
    }

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    const chatId = query.message?.chat?.id;
    if (chatId) {
      await bot.sendMessage(
        chatId,
        "⚠️ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    }
  }
});

bot.on("message", async (msg) => {
  if (!msg.from) {
    return;
  }

  try {
    const orderHandled = await orderHandler.handleMessage(msg);
    if (orderHandled) {
      return;
    }

    await mainHandler.handleMessage(msg);
  } catch (error) {
    await bot.sendMessage(
      msg.chat.id,
      "⚠️ Jarayonda xatolik yuz berdi. /start buyrug'ini bosing."
    );
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

console.log("Mushk.uz premium bot is running...");
