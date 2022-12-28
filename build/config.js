"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const yaml_1 = __importDefault(require("yaml"));
const fs_1 = __importDefault(require("fs"));
require("dotenv").config();
exports.config = yaml_1.default.parse(fs_1.default.readFileSync("./config/config.yaml", "utf8"));
if (!process.env.TG_BOT_TOKEN) {
    console.error("Please set your bot token in TG_BOT_TOKEN env");
    process.exit(1);
}
else {
    exports.config.bot_token = process.env.TG_BOT_TOKEN;
}
if (!process.env.TG_STAFF_CHAT_ID) {
    console.error("Please set staff chat id in TG_STAFF_CHAT_ID env");
    process.exit(1);
}
else {
    exports.config.staff_chat_id = process.env.TG_STAFF_CHAT_ID;
}
if (!process.env.TG_OWNER_ID) {
    console.error("Please set owner id in TG_OWNER_ID env");
    process.exit(1);
}
else {
    exports.config.owner_id = process.env.TG_OWNER_ID;
}
//# sourceMappingURL=config.js.map