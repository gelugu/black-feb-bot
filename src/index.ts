import { log } from "./utils/logger";
import { config } from "./config";
import { bot } from "./bot/bot";

const main = () => {
  log.info(`Starting bot (${config.bot_name})`, true);

  bot.start();
};

main();
