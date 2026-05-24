# Telegram Bot

Bu loyiha `index.js` dagi Telegram botni ishga tushiradi.

## Oddiy ishga tushirish

```bash
npm run bot
```

## Botni toxtamasdan ishlatish (PM2)

PM2 botni fon rejimida ushlab turadi. Terminal yoki IDE yopilsa ham bot ishlashda davom etadi.

```bash
npm run bot:pm2:start
```

Foydali buyruqlar:

```bash
npm run bot:pm2:logs
npm run bot:pm2:restart
npm run bot:pm2:stop
npm run bot:pm2:delete
```

## Windows qayta yoqilganda ham avtomatik ishga tushirish

1) PM2 jarayonlarini saqlang:

```bash
npm run bot:pm2:save
```

2) Startup script yarating:

```bash
npx pm2 startup
```

`npx pm2 startup` chiqargan PowerShell komandani **Administrator** sifatida ishga tushiring.

Muhim: noutbuk `sleep` holatiga otsa, internet va jarayonlar toxtaydi. Toxtamasdan ishlashi uchun noutbukni uyquga ketmaslikka sozlang yoki botni VPS/serverga deploy qiling.

## 24/7 ishlatish (noutbuk o'chsa ham) - Railway

Noutbuk toliq o'chgan holatda bot ishlashi uchun uni cloud serverga deploy qiling.

### 1) Kodni GitHubga joylang

Bu loyiha hozir git repo emas. Avval GitHubga upload qiling (zip emas, repo sifatida).

### 2) Railway project yarating

1. [Railway](https://railway.app/) ga kiring.
2. `New Project` -> `Deploy from GitHub repo`.
3. Shu repozitoriyani tanlang.

### 3) Environment Variables kiriting

Railway project ichida quyidagilarni qo'shing:

- `BOT_TOKEN`
- `ADMIN_CHAT_ID`
- `PAGE_SIZE` (masalan `8`)
- `SECOND_BOT_TOKEN` (ixtiyoriy)
- `SECOND_BOT_CHAT_ID` (ixtiyoriy)

### 4) Start command

Railway odatda `npm start`ni avtomatik oladi. Bu loyiha uchun `start` skript allaqachon bor:

```bash
npm start
```

### 5) Deploy va tekshirish

- Deploy tugagach Railway Logs bo'limida quyidagini korasiz:
  - `Mushk.uz premium bot is running...`
- Telegramda `/start` yuborib tekshiring.

### Muhim xavfsizlik

Agar token noto'g'ri joyda oshkor bo'lgan bo'lsa, BotFather orqali tokenni darhol yangilang va eski tokenni bekor qiling.
"# mushkuzbot" 
