import fastq from "fastq";
import { Telegram } from "telegraf";
import type { queueAsPromised } from "fastq";

const { BOT_TOKEN } = process.env;
export const telegram = new Telegram(BOT_TOKEN!);

export type Task = {
  chatId: number;
  text: string;
};

export const q: queueAsPromised<Task> = fastq.promise(telegramMailer, 1);

async function telegramMailer({ chatId, text }: Task): Promise<void> {
  // No need for a try-catch block, fastq handles errors automatically
  await telegram.sendMessage(chatId, text, { parse_mode: "HTML" });
}
