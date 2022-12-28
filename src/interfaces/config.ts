import { Autoreply, Command, Language } from ".";

export interface Config {
  bot_name: string;
  bot_token: string;
  staff_chat_id: string;
  owner_id: string;
  commands: Command[];
  parse_mode: string;
  language: Language;
  autoreply: Autoreply[];
}