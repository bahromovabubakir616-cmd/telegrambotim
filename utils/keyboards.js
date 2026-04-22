export function mainMenuKeyboard() {
  return {
    keyboard: [
      ["🛍 Perfumes", "🔥 Top Products"],
      ["🔍 Search", "❤️ My Favorites"],
      ["📦 My Orders", "📞 Contact"],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

export function contactRequestKeyboard() {
  return {
    keyboard: [[{ text: "📱 Share phone", request_contact: true }], ["❌ Cancel"]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function removeKeyboard() {
  return {
    remove_keyboard: true,
  };
}

export function categoriesInlineKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🏆 Bestseller", callback_data: "cat_bestseller_1" }],
      [{ text: "💎 Premium", callback_data: "cat_premium_1" }],
      [{ text: "💰 Budget", callback_data: "cat_budget_1" }],
      [{ text: "🕌 Arab", callback_data: "cat_arab_1" }],
      [{ text: "⬅ Back", callback_data: "back_main" }],
    ],
  };
}
