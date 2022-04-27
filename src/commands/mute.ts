// TODO: add [reason]

import {
  MatrixClient,
  MessageEvent,
  MentionPill,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, lookup_user } from "../lookupUser";
import { guild, mute_role } from "./discord_handler";
import { COMMAND_PREFIX } from "./handler";
import { MessageActionRow } from "discord.js";
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
    return client.sendMessage(roomId, {
      body: "Usage: " + COMMAND_PREFIX + "mute <user> [time]",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Usage: " + COMMAND_PREFIX + "mute &lt;user&gt; [time]",
    });
  }

  let user = args[1] || "";

  if (formatted_body) {
    if (formatted_body.includes("<a href=")) {
      user =
        formatted_body.substring(
          formatted_body.indexOf('<a href="https://matrix.to/#/') + 29, // 29 = char length of `<a href="https://matrix.to/#/`
          formatted_body.indexOf('">')
        ) || user;
    }
  }

  // The first argument is always going to be us, so get the second argument instead.
  let lookup: {
    graim_name: string;
    user_matrix: string;
    user_discord: string;
    moderator: boolean;
  };
  let msToUnmute: number;

  try {
    msToUnmute = ms(formatted_body.split("> ")[1]);
  } catch {
    msToUnmute = ms("1d");
  }
  console.log(args[1])
  lookup = lookup_user(args[1]);
  console.log(lookup);

  if (!lookup.graim_name) {
    let user_discord = await guild.members.fetch(user_discordId(user));
    console.log(user_discord);
    if(user_discord) user_discord.roles.add(mute_role);
    client.setUserPowerLevel(user, roomId, -1);
    
    setTimeout(() => {
      client.setUserPowerLevel(user, roomId, 0);
      user_discord.roles.remove(mute_role);
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

  client.setUserPowerLevel(lookup.user_matrix, roomId, -1);
  let user_discord = await guild.members.fetch(lookup.user_discord);
  user_discord.roles.add(mute_role);
  setTimeout(() => {
    client.setUserPowerLevel(lookup.user_matrix, roomId, 0);
    user_discord.roles.remove(mute_role);
  }, msToUnmute);

  return client.sendMessage(roomId, {
    body: "Muted " + lookup.graim_name + ".",
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: "Muted " + htmlEscape(lookup.graim_name) + ".",
  });
}
