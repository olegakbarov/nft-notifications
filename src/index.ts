import dotenv from "dotenv";
dotenv.config();

import { scheduler } from "./scheduler";
import { bot } from "./bot";

scheduler.start();
bot.launch();
