import { Bot as GrammyBot, Context } from "grammy";
import { MessageEntity, ParseMode, ReplyMessage } from "grammy/out/types.node";
import { config } from "../config";
import { UserInfo } from "../interfaces";
import { log } from "../utils/logger";

export class Bot extends GrammyBot {
  parseMode: ParseMode = "Markdown";

  constructor(token: string) {
    super(token);

    this.initErrorHandler();
    this.initCommands();

    this.handleMessages();
  }

  // Init commands from config 'commands' section
  private initCommands = async () => {
    await this.api.setMyCommands(
      config.commands
        .filter((c) => !c.staffOnly)
        .map((c) => ({ command: c.name, description: c.description }))
    );

    config.commands.forEach((c) => {
      this.command(c.name, (ctx) => {
        if (c.staffText && ctx.chat.id == parseInt(config.staff_chat_id)) {
          ctx.reply(c.staffText, {
            parse_mode: this.parseMode,
          });
        } else {
          ctx.reply(c.text, {
            parse_mode: this.parseMode,
          });
        }
      });
    });
  };

  private handleMessages = async () => {
    this.on("message", async (ctx) => {
      // FIXME
      if (
        ctx.message.text &&
        config.commands.map((c) => c.name).includes(ctx.message.text.replace(/^\//, ""))
      )
        return;

      try {
        if (ctx.chat.id !== parseInt(config.staff_chat_id)) {
          this.handleUserMessage(ctx);
        } else {
          this.handleStaffMessage(ctx);
        }
      } catch (error) {
        log.error(JSON.stringify(error, null, 2));
      }
    });
  };

  private handleUserMessage = async (ctx: Context) => {
    log.info(
      `Handling request from user ${ctx.from.username} (chat ${ctx.chat.id})...`
    );

    let name = ctx.from.first_name;
    if (ctx.from.last_name) name += ` ${ctx.from.last_name}`;
    name += ` (@${ctx.from.username})`;

    const messageId = `${ctx.from.id}:${ctx.message.message_id}`;

    log.info(`Sending message (${messageId}) to ${name}...`);
    const messageTextPrefix =
      `${config.language.newMessageFrom} ${name}\n` +
      `${config.language.language}: ${ctx.from.language_code}\n` +
      `id:${messageId}\n\n`;

    this.forwardMessage(ctx, config.staff_chat_id, messageTextPrefix);

    log.info("Message sent, sending reply to user...");
    ctx.reply(config.language.userReplyMessage);

    log.info("Reply sent to user, request handled");
  };

  private handleStaffMessage = async (ctx: Context) => {
    if (!ctx.message.reply_to_message) return;

    log.info(
      `Handling message in staff chat (${ctx.chat.id}) from ${ctx.from.username}...`
    );

    log.info("Parsing user info from message...");
    const textFromReply = this.parseTextFromReply(ctx.message.reply_to_message);
    const userInfo = this.parseUserInfo(
      textFromReply,
      ctx.message.reply_to_message.entities
    );
    const { username, name, chatId, messageId } = userInfo;

    log.info(`Sending message to chat ${chatId} (user ${username})`);
    const messageTextPrefix = `${config.language.dear} ${name}\n\n`;

    this.forwardMessage(
      ctx,
      chatId,
      messageTextPrefix,
      `\n\n${config.language.regards}`,
      messageId
    );

    log.info(
      `Message sent, replying to ${ctx.from.username} in staff chat (${ctx.chat.id})`
    );
    const replyText = `${config.language.messageSentToUser} ${name} (@${username}).`;
    ctx.reply(replyText);

    log.info("Reply sent to staff chat, request handled");
  };

  private parseTextFromReply = (reply: ReplyMessage): string => {
    if (reply.text) {
      return reply.text;
    } else if (reply.caption) {
      return reply.caption;
    } else {
      log.error(
        `Can't find any text to reply\n\n\`\`\`${JSON.stringify(
          reply,
          null,
          2
        )}\`\`\``
      );
      return "";
    }
  };

  private forwardMessage = async (
    ctx: Context,
    chatId: string,
    messageTextPrefix: string = "",
    messageTextPostfix: string = "",
    reply_to_message_id: number | undefined = undefined
  ) => {
    if (ctx.message.text) {
      try {
        await this.api.sendMessage(
          chatId,
          messageTextPrefix + ctx.message.text + messageTextPostfix,
          {
            reply_to_message_id,
            entities: this.fixEntitiesOffset(
              ctx.message.entities,
              messageTextPrefix.length
            ),
          }
        );
      } catch (error: any) {
        log.error(error);
      }
    } else if (ctx.message.photo) {
      const caption = ctx.message.caption || "";
      this.api.sendPhoto(
        chatId,
        ctx.message.photo[ctx.message.photo.length - 1].file_id,
        {
          caption: messageTextPrefix + caption + messageTextPostfix,
          caption_entities: this.fixEntitiesOffset(
            ctx.message.caption_entities,
            messageTextPrefix.length
          ),
        }
      );
    } else if (ctx.message.document) {
      const caption = ctx.message.caption || "";
      this.api.sendDocument(chatId, ctx.message.document.file_id, {
        caption: messageTextPrefix + caption + messageTextPostfix,
        caption_entities: this.fixEntitiesOffset(
          ctx.message.caption_entities,
          messageTextPrefix.length
        ),
      });
    } else if (ctx.message.voice) {
      const caption = ctx.message.caption || "";
      this.api.sendVoice(chatId, ctx.message.voice.file_id, {
        caption: messageTextPrefix + caption + messageTextPostfix,
        caption_entities: this.fixEntitiesOffset(
          ctx.message.caption_entities,
          messageTextPrefix.length
        ),
      });
    } else if (ctx.message.video) {
      const caption = ctx.message.caption || "";
      this.api.sendVoice(chatId, ctx.message.video.file_id, {
        caption: messageTextPrefix + caption + messageTextPostfix,
        caption_entities: this.fixEntitiesOffset(
          ctx.message.caption_entities,
          messageTextPrefix.length
        ),
      });
    } else if (ctx.message.video_note) {
      await this.api.sendVideoNote(chatId, ctx.message.video_note.file_id);
      await this.api.sendMessage(
        chatId,
        messageTextPrefix + messageTextPostfix,
        {
          reply_to_message_id,
          entities: this.fixEntitiesOffset(
            ctx.message.entities,
            messageTextPrefix.length
          ),
        }
      );
      if (chatId === config.staff_chat_id) {
        this.api.sendMessage(chatId, config.language.noCaptionWarning, {
          parse_mode: this.parseMode,
        });
      }
    } else if (ctx.message.sticker) {
      await this.api.sendSticker(chatId, ctx.message.sticker.file_id);
      await this.api.sendMessage(
        chatId,
        messageTextPrefix + messageTextPostfix,
        {
          reply_to_message_id,
          entities: this.fixEntitiesOffset(
            ctx.message.entities,
            messageTextPrefix.length
          ),
        }
      );
      if (chatId === config.staff_chat_id) {
        this.api.sendMessage(chatId, config.language.noCaptionWarning, {
          parse_mode: this.parseMode,
        });
      }
    } else {
      await log.error(
        `Unhandled message type\n\n\`\`\`${JSON.stringify(
          ctx.message,
          null,
          2
        )}\`\`\``
      );
      await this.api.sendMessage(config.owner_id, ctx.from.username);
      this.api.forwardMessage(
        config.owner_id,
        ctx.chat.id,
        ctx.message.message_id
      );
    }
  };

  private parseUserInfo = (
    message: string,
    entities: MessageEntity[]
  ): UserInfo | undefined => {
    const match = message.match(
      new RegExp(
        `${config.language.newMessageFrom}\\s(.*)\\s\\(@(.*)\\)\n` +
          `${config.language.language}:\\s\\w+\n` +
          `id:(\\d+):(\\d+)`
      )
    );

    // DELETE IT - DEPRECATED
    if (!match && entities) {
      const links = entities.filter((e) => e.type === "text_mention");
      if (links.length !== 1) return;
      return {
        name: links[0]["user"]["first_name"],
        username: links[0]["user"]["username"],
        chatId: links[0]["user"]["id"],
        messageId: undefined,
      };
    }

    if (!match || match.length !== 5) {
      log.error(
        `Error while parsing message:\n${message}\n${JSON.stringify(
          match,
          null,
          2
        )}`
      );
      return;
    }

    return {
      name: match[1],
      username: match[2],
      chatId: match[3],
      messageId: parseInt(match[4]),
    };
  };

  private fixEntitiesOffset = (
    entities: MessageEntity[],
    prefixLength: number
  ): MessageEntity[] => {
    if (!entities) return [];
    return entities.map((e) => ({ ...e, offset: e.offset + prefixLength }));
  };

  private initErrorHandler = () => {
    this.catch((error) => {
      log.error(`${error.message}\n\n\`\`\`${error.stack}\`\`\``);
    });
  };
}

export const bot = new Bot(config.bot_token);
