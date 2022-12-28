"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.Logger = void 0;
const bot_1 = require("../bot/bot");
const config_1 = require("../config");
class Logger {
    constructor() {
        this.info = async (s, sendMessage = false) => {
            const date = new Date();
            console.log(`${date.toLocaleString()} INFO: ${s}`);
            if (sendMessage) {
                await bot_1.bot.api.sendMessage(config_1.config.owner_id, `New information from *${config_1.config.bot_name}* bot\nDate: ${date}\nMessage:\n\n${s}`, { parse_mode: bot_1.bot.parseMode });
            }
        };
        this.warning = async (s, sendMessage = false) => {
            const date = new Date();
            console.warn(`${date.toLocaleString()} WARNING: ${s}`);
            if (sendMessage) {
                await bot_1.bot.api.sendMessage(config_1.config.owner_id, `New warning from ${config_1.config.bot_name}\nDate: ${date}\nMessage:\n\n${s}`, { parse_mode: bot_1.bot.parseMode });
            }
        };
        this.error = async (s, sendMessage = true) => {
            const date = new Date();
            console.error(`${date.toLocaleString()} ERROR: ${s}`);
            if (sendMessage) {
                await bot_1.bot.api.sendMessage(config_1.config.owner_id, `New error from ${config_1.config.bot_name}\nDate: ${date}\nMessage:\n\n${s}`, { parse_mode: bot_1.bot.parseMode });
            }
        };
    }
}
exports.Logger = Logger;
exports.log = new Logger();
//# sourceMappingURL=logger.js.map