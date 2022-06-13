import { Telegram } from "telegraf";

const { BOT_TOKEN } = process.env;
export const telegram = new Telegram(BOT_TOKEN!);
