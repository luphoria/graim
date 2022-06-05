import {
  LogService,
  MatrixClient,
  MessageEvent,
  RichReply,
  UserID,
} from "matrix-bot-sdk";
import { runKickCommand } from "./kick";
import { runBanCommand } from "./ban";
import { runUnbanCommand } from "./unban";
import config from "../config";
import * as htmlEscape from "escape-html";
import { runUserinfoCommand } from "./userinfo";
import { runMuteCommand } from "./mute";
import { runUnmuteCommand } from "./unmute";
import { runAddUserCommand } from "./adduser";
import { runDeleteUserCommand } from "./deleteuser";
import { startedWhen } from "../index";
import { runWhoSentCommand } from "./whosent";
import { runStrikeUserCommand } from "./strike";
import { runClearStrikesCommand } from "./clearstrikes";
import { runLockCommand } from "./lock";
import { runUnlockCommand } from "./unlock";
import { runBridgeCommand } from "./bridgeroom";
import { runUnbridgeCommand } from "./unbridgeroom";
import { runSetLoggingRoomCommand } from "./setloggingroom";

// The prefix required to trigger the bot. The bot will also respond
// to being pinged directly.
export const COMMAND_PREFIX = config.prefix;
export let rooms;
// This is where all of our commands will be handled
export default class CommandHandler {
  // Just some variables so we can cache the bot's display name and ID
  // for command matching later.
  private displayName: string;
  private userId: string;
  private localpart: string;

  constructor(private client: MatrixClient) {}

  public async start() {
    // Populate the variables above (async)
    await this.prepareProfile();

    // Set up the event handler
    this.client.on("room.message", this.onMessage.bind(this));
  }

  private async prepareProfile() {
    this.userId = await this.client.getUserId();
    this.localpart = new UserID(this.userId).localpart;

    try {
      const profile = await this.client.getUserProfile(this.userId);
      rooms = await this.client.getJoinedRooms();
      if (profile && profile["displayname"])
        this.displayName = profile["displayname"];
    } catch (e) {
      // Non-fatal error - we'll just log it and move on.
      LogService.warn("CommandHandler", e);
    }
  }

  private async onMessage(roomId: string, ev: any) {
    const event = new MessageEvent(ev);
    if (event.isRedacted) return; // Ignore redacted events that come through
    if (event.sender === this.userId) return; // Ignore ourselves
    if (event.messageType !== "m.text") return; // Ignore non-text messages
    if (startedWhen > event.timestamp) return;

    // Ensure that the event is a command before going on. We allow people to ping
    // the bot as well as using our COMMAND_PREFIX.
    const prefixes = [
      COMMAND_PREFIX,
      `${this.localpart}:`,
      `${this.displayName}:`,
      `${this.userId}:`,
    ];
    const prefixUsed = prefixes.find((p) => event.textBody.startsWith(p));
    if (!prefixUsed) return; // Not a command (as far as we're concerned)

    // Check to see what the arguments were to the command
    const args = event.textBody.substring(prefixUsed.length).trim().split(" ");
    const formatted_body =
      event.content?.["format"] === "org.matrix.custom.html"
        ? event.content?.["formatted_body"]
        : null;
    // Try and figure out what command the user ran
    try {
      switch (args[0]) {
        case "lock":
          runLockCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "unlock":
          runUnlockCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "kick":
          runKickCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "ban":
          runBanCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "unban":
          runUnbanCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "userinfo":
          runUserinfoCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "mute":
          runMuteCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "unmute":
          runUnmuteCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "adduser":
          runAddUserCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "deleteuser":
          runDeleteUserCommand(
            roomId,
            event,
            args,
            this.client,
            formatted_body
          );
          break;
        case "bridgeroom":
          runBridgeCommand(roomId, event, args, this.client, formatted_body);
          break;
        case "unbridgeroom":
          runUnbridgeCommand(roomId, event, this.client, formatted_body);
          break;
        case "setloggingroom":
          runSetLoggingRoomCommand(roomId, event, this.client, formatted_body);
          break;
        case "strike":
          runStrikeUserCommand(
            roomId,
            event,
            args,
            this.client,
            formatted_body
          );
          break;
        case "clearstrikes":
          runClearStrikesCommand(
            roomId,
            event,
            args,
            this.client,
            formatted_body
          );
          break;
        case "whosent":
          runWhoSentCommand(roomId, args, this.client);
          break;
        case "help":
          const help =
            `${COMMAND_PREFIX}lock [room] - Locks room/channel\n` +
            `${COMMAND_PREFIX}unlock [room] - Unlocks room/channel\n` +
            `${COMMAND_PREFIX}kick <user> [reason] - Kicks a user\n` +
            `${COMMAND_PREFIX}ban <user> [reason] - Bans a user\n` +
            `${COMMAND_PREFIX}unban <user> [reason] - Unbans a user\n` +
            `${COMMAND_PREFIX}mute <user> [time:s,m,h,d] [reason] - Mutes a user\n` +
            `${COMMAND_PREFIX}unmute <user> [reason] - Unmutes a user\n` +
            `${COMMAND_PREFIX}strike <user> [reason] - Strikes a user\n` +
            `${COMMAND_PREFIX}clearstrikes <user> [reason] - Clears all strikes from a user\n` +
            `\n` +
            `${COMMAND_PREFIX}adduser <graim_name> <matrix_mention> <discord_mention> [moderator] - Adds user to graim database (for syncing moderation)\n` +
            `${COMMAND_PREFIX}deleteuser <user> - Removes a user from graim database\n` +
            `${COMMAND_PREFIX}bridgeroom <Discord channel id> - Bridges a Discord channel to a Matrix room (for lock, unlock)\n` +
            `${COMMAND_PREFIX}unbridgeroom - Removes a room's bridge from the graim db\n` +
            `${COMMAND_PREFIX}setloggingroom - Sets the room to send logs to\n` +
            `${COMMAND_PREFIX}whosent <link to Discord message> - tells you what Matrix user sent a message\n` +
            `${COMMAND_PREFIX}userinfo [user] - Provides information about the user`;

          const text = `Help menu:\n${help}`;
          const html = `<b>Help menu:</b><br /><pre><code>${htmlEscape(
            help
          )}</code></pre>`.replace(/\\n/g, "<br/>");
          const reply = RichReply.createFor(roomId, ev, text, html); // Note that we're using the raw event, not the parsed one!
          reply["msgtype"] = "m.notice"; // Bots should always use notices
          return this.client.sendMessage(roomId, reply);
      }
    } catch (e) {
      // Log the error
      LogService.error("CommandHandler", e);

      // Tell the user there was a problem
      const message = "There was an error processing your command";
      return this.client.replyNotice(roomId, ev, message);
    }
  }
}
