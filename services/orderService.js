import { escapeHtml } from "../utils/format.js";

function buildOrderText(order) {
  return [
    "🛎 <b>NEW ORDER</b>",
    `🌸 Product: <b>${escapeHtml(order.productName)}</b>`,
    `📦 Size: <b>${escapeHtml(order.size)}</b>`,
    `👤 Name: <b>${escapeHtml(order.customerName)}</b>`,
    `📱 Phone: <b>${escapeHtml(order.phone)}</b>`,
    `📍 Address: <b>${escapeHtml(order.address)}</b>`,
  ].join("\n");
}

async function sendToSecondBot(config, text) {
  if (!config.secondBotToken || !config.secondBotChatId) {
    return;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${config.secondBotToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.secondBotChatId,
        text,
        parse_mode: "HTML",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Second bot API returned ${response.status}`);
  }
}

export function createOrderService(config) {
  return {
    async dispatchOrder(bot, order) {
      const text = buildOrderText(order);

      await bot.sendMessage(config.adminChatId, text, { parse_mode: "HTML" });
      await sendToSecondBot(config, text);
    },
  };
}
