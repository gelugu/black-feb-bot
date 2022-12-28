"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./utils/logger");
const config_1 = require("./config");
const bot_1 = require("./bot/bot");
const main = () => {
    logger_1.log.info(`Starting bot (${config_1.config.bot_name})`, true);
    bot_1.bot.start();
};
main();
//# sourceMappingURL=index.js.map