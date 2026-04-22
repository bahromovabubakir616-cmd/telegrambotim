export function createStore() {
  return {
    sessions: new Map(),
    favorites: new Map(),
    recentViews: new Map(),
    ordersByUser: new Map(),
    analytics: {
      totalOrders: 0,
      productOrders: new Map(),
    },
  };
}

export function getSession(store, userId) {
  return store.sessions.get(userId);
}

export function setSession(store, userId, data) {
  store.sessions.set(userId, data);
}

export function clearSession(store, userId) {
  store.sessions.delete(userId);
}

export function toggleFavorite(store, userId, productId) {
  const current = store.favorites.get(userId) || new Set();
  if (current.has(productId)) {
    current.delete(productId);
  } else {
    current.add(productId);
  }
  store.favorites.set(userId, current);
  return current.has(productId);
}

export function getFavorites(store, userId) {
  return [...(store.favorites.get(userId) || new Set())];
}

export function addRecentView(store, userId, productId) {
  const current = store.recentViews.get(userId) || [];
  const next = [productId, ...current.filter((item) => item !== productId)].slice(0, 10);
  store.recentViews.set(userId, next);
}

export function getRecentViews(store, userId) {
  return store.recentViews.get(userId) || [];
}

export function addOrderForUser(store, userId, order) {
  const orders = store.ordersByUser.get(userId) || [];
  orders.unshift(order);
  store.ordersByUser.set(userId, orders.slice(0, 25));

  store.analytics.totalOrders += 1;
  const currentProductCount = store.analytics.productOrders.get(order.productId) || 0;
  store.analytics.productOrders.set(order.productId, currentProductCount + 1);
}

export function getOrdersForUser(store, userId) {
  return store.ordersByUser.get(userId) || [];
}
