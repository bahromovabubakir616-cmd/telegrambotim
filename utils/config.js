import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required in environment variables.`);
  }
  return value;
}

export function buildConfig() {
  const rootDir = path.resolve(__dirname, "..");
  const productsFilePath = path.join(rootDir, "products.json");

  return {
    botToken: getRequiredEnv("BOT_TOKEN"),
    adminChatId: getRequiredEnv("ADMIN_CHAT_ID"),
    secondBotToken: process.env.SECOND_BOT_TOKEN || "",
    secondBotChatId: process.env.SECOND_BOT_CHAT_ID || "",
    productsFilePath,
    pageSize: Number(process.env.PAGE_SIZE || 8),
  };
}
