// TODO: add [reason]
// -=- SYNTAX : ;unmute <user>
import {
  MatrixClient,
  MentionPill,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, lookup_user } from "../lookupUser";
import { guild, mute_role } from "./discord_handler";
import { COMMAND_PREFIX, rooms } from "./handler";

export async function runUnmuteCommand(
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

  if (!args[1]) { // user didn't provide the required number of args
    return client.sendMessage(roomId, {
      body: "Usage: " + COMMAND_PREFIX + "unmute <user>",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Usage: " + COMMAND_PREFIX + "unmute &lt;user&gt;",
    });
  }

  let user = "@" + args[1] || "";

  if (formatted_body) {
    if (formatted_body.includes("<a href=\"https://matrix.to/#/")) { // MentionPill was used
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

  lookup = lookup_user(args[1]);

  if (!lookup.graim_name) {
    if (user_discordId(user)) {
      let user_discord = await guild.members.fetch(user_discordId(user));
      if (user_discord) user_discord.roles.remove(mute_role);
    }

    rooms.forEach((roomId) => {
      client.setUserPowerLevel(user, roomId, 0);
    });

    let mention = await MentionPill.forUser(user);

    return client.sendMessage(roomId, {
      body: "Unmuted " + mention.text + ".",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Unmuted " + mention.html + ".",
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

  let user_discord = await guild.members.fetch(lookup.user_discord);
  rooms.forEach((roomId) => {
    client.setUserPowerLevel(lookup.user_matrix, roomId, 0);
  });
  user_discord.roles.remove(mute_role);

  return client.sendMessage(roomId, {
    body: "Unmuted " + lookup.graim_name + ".",
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: "Unmuted " + htmlEscape(lookup.graim_name) + ".",
  });
}
