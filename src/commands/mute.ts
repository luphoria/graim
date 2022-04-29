// TODO: log [reason]
// -=- SYNTAX : ;mute <user> [time (smhd)] [reason]
import {
  MatrixClient,
  MessageEvent,
  MentionPill,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, lookup_user, db, saveDB } from "../lookupUser";
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
  let commandString = args.join(" ");

  if (formatted_body) {
    commandString = formatted_body.replace(/<a href="https:\/\/matrix\.to\/#\/@|">(.*?)<\/a>/g, "");
  }

  let command = commandString.split(" ");

  let reason = command.slice(3).join(" ") || "No reason specified."
  let user = command[1] || ""; // we default to an empty string because it causes non-fatal errors.

  let lookup: {
    graim_name: string;
    user_matrix: string;
    user_discord: string;
    moderator: boolean;
  };

  let msToUnmute = ms(command[2]);
  if(!msToUnmute) {
    msToUnmute = ms("1d");
    reason = command.slice(2).join(" ") || "No reason specified."
  }

  lookup = lookup_user(user);

  if (!lookup.graim_name) {
    if (user_discordId(user)) {
      try {
        let user_discord = await guild.members.fetch(user_discordId("@" + user)); // fetch the discord user
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
      body: "Muted " + mention.text + " for reason " + reason + "!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Muted " + mention.html + " for reason <code>" + htmlEscape(reason) + "</code>!",
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

  db.users
    .filter((dbuser) => {
      return dbuser.name == lookup.graim_name;
    })[0]
    .strikes.push({
      time: Date.now(),
      action: "mute",
      reason: reason,
    });

  saveDB(db);

  let strikes = db.users.filter((dbuser) => {
    return dbuser.name == lookup.graim_name;
  })[0].strikes;

  return client.sendMessage(roomId, {
    body: "Muted " + lookup.graim_name + " for reason " + reason + "!\nCurrent strikes: " + strikes.length,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: "Muted " + lookup.graim_name + " for reason <code>" + htmlEscape(reason) + "</code>!\nCurrent strikes: " + strikes.length,
  });
}
