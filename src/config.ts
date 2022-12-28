import YAML from "yaml";
import fs from "fs";
import { Config } from "./interfaces";

require("dotenv").config();

export const config = YAML.parse(
  fs.readFileSync("./config/config.yaml", "utf8")
) as Config;

if (!process.env.TG_BOT_TOKEN) {
  console.error("Please set your bot token in TG_BOT_TOKEN env");
  process.exit(1);
} else {
  config.bot_token = process.env.TG_BOT_TOKEN
}

if (!process.env.TG_STAFF_CHAT_ID) {
  console.error("Please set staff chat id in TG_STAFF_CHAT_ID env");
  process.exit(1);
} else {
  config.staff_chat_id = process.env.TG_STAFF_CHAT_ID
}

if (!process.env.TG_OWNER_ID) {
  console.error("Please set owner id in TG_OWNER_ID env");
  process.exit(1);
} else {
  config.owner_id = process.env.TG_OWNER_ID
}
