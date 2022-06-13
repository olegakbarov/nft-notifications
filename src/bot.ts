import { Telegraf } from "telegraf";
const { BOT_TOKEN } = process.env;
const bot = new Telegraf(BOT_TOKEN!);

bot.use(async (ctx: any, next) => {
  if (ctx.update.callback_query) console.log("callback query received");

  try {
    const { message } = ctx.update;
    console.log("message received", message);

    // FIXME: set up initial subs here
    if (ctx.update.message.text.startsWith("/start")) {
      const data = ctx.update.message.text.replace("/start", "").trim();
      console.log("address:", data);
    }
  } catch (err) {
    console.error(err);
  }
});

export { bot };
