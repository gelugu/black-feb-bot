import { bot } from "../bot/bot";
import { config } from "../config";

export class Logger {
  info = async (s: string, sendMessage = false) => {
    const date = new Date();

    console.log(`${date.toLocaleString()} INFO: ${s}`);

    if (sendMessage) {
      await bot.api.sendMessage(
        config.owner_id,
        `New information from *${config.bot_name}* bot\nDate: ${date}\nMessage:\n\n${s}`,
        {parse_mode: bot.parseMode}
      );
    }
  };
  warning = async (s: string, sendMessage = false) => {
    const date = new Date();

    console.warn(`${date.toLocaleString()} WARNING: ${s}`);

    if (sendMessage) {
      await bot.api.sendMessage(
        config.owner_id,
        `New warning from ${config.bot_name}\nDate: ${date}\nMessage:\n\n${s}`,
        {parse_mode: bot.parseMode}
      );
    }
  };
  error = async (s: string, sendMessage = true) => {
    const date = new Date();

    console.error(`${date.toLocaleString()} ERROR: ${s}`);

    if (sendMessage) {
      await bot.api.sendMessage(
        config.owner_id,
        `New error from ${config.bot_name}\nDate: ${date}\nMessage:\n\n${s}`,
        {parse_mode: bot.parseMode}
      );
    }
  };
}

export const log = new Logger();
