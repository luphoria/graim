// TODO: add [reason]
// -=- SYNTAX : ;mute <user> [time (smhd)]
import {
  MatrixClient,
  MessageEvent,
  MentionPill,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, lookup_user } from "../lookupUser";
import { guild, mute_role } from "./discord_handler";
import { COMMAND_PREFIX, rooms } from "./handler";
const ms = require("ms");

export async function runMuteCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {
  if (!lookup_user(event.sender).moderator) {
    return client.sendMessage(roomId, {
      body: "You aren't a moderator!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "You aren't a moderator!",
    });
  }

  if (!args[1]) {
    // user provided no arguments
    return client.sendMessage(roomId, {
      body:
        "Usage: " +
        COMMAND_PREFIX +
        "mute <user> [time (1 day if not specified)]",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "Usage: " +
        COMMAND_PREFIX +
        "mute &lt;user&gt; [time (1 day if not specified)]",
    });
  }

  let user = "@" + args[1] || ""; // we default to an empty string because it causes non-fatal errors.

  if (formatted_body) {
    // sanity check - MentionPill cannot exist without a formatted body
    if (formatted_body.includes('<a href="https://matrix.to/#/')) {
      // MentionPill was used
      user =
        formatted_body.substring(
          formatted_body.indexOf('<a href="https://matrix.to/#/') + 29, // 29 = char length of `<a href="https://matrix.to/#/`
          formatted_body.indexOf('">')
        ) || user;
    }
  }

  let lookup: {
    graim_name: string;
    user_matrix: string;
    user_discord: string;
    moderator: boolean;
  };

  let msToUnmute: number;

  try {
    msToUnmute = ms(formatted_body.split("> ")[1]); // looks weird, but this is just catching the equivalent of args[2]
  } catch {
    msToUnmute = ms("1d");
  }

  lookup = lookup_user(args[1]);

  if (!lookup.graim_name) {
    if (user_discordId(user)) {
      try {
        let user_discord = await guild.members.fetch(user_discordId(user)); // fetch the discord user
        if (user_discord) user_discord.roles.add(mute_role);
        setTimeout(() => {
          user_discord.roles.remove(mute_role);
        }, msToUnmute);
      } catch {}
    }

    rooms.forEach((roomId) => {
      client.setUserPowerLevel(user, roomId, -1);
    });

    setTimeout(() => {
      // once this time has passed, undo the mute!
      rooms.forEach((roomId) => {
        client.setUserPowerLevel(user, roomId, 0);
      });
    }, msToUnmute);

    let mention = await MentionPill.forUser(user);

    return client.sendMessage(roomId, {
      body: "Muted " + mention.text + ".",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Muted " + mention.html + ".",
    });
  }

  try {
    lookup_user(args[1]);
  } catch {
    return client.sendMessage(roomId, {
      body: "I don't think that user is in the graim database!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "I don't think that user is in the graim database!",
    });
  }

  rooms.forEach((roomId) => {
    client.setUserPowerLevel(lookup.user_matrix, roomId, -1);
  });
  try {
    let user_discord = await guild.members.fetch(lookup.user_discord);
    user_discord.roles.add(mute_role);

    setTimeout(() => {
      // once this time has passed, undo the mute!
      rooms.forEach((roomId) => {
        client.setUserPowerLevel(lookup.user_matrix, roomId, 0);
      });
      user_discord.roles.remove(mute_role);
    }, msToUnmute);
  } catch {}

  return client.sendMessage(roomId, {
    body: "Muted " + lookup.graim_name + ".",
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: "Muted " + htmlEscape(lookup.graim_name) + ".",
  });
}
