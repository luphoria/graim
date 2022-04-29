// TODO: log [reason]
// -=- SYNTAX : ;unban <user> [reason]
import {
  MatrixClient,
  MessageEvent,
  MentionPill,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user, user_discordId } from "../lookupUser";
import { guild } from "./discord_handler";
import { rooms } from "./handler";

export async function runUnbanCommand(
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
  console.log(`=======\n${formatted_body}\n========`);

  let mentioned = false; // did the user provide a MentionPill or a plain-text@messa.ge?
  let user = args[1] || null;
  let reason = args.slice(2).join(" ") || "No reason specified";
  if (formatted_body) {
    // sanity check
    if (formatted_body.includes('<a href="https://matrix.to/#/')) {
      mentioned = true;
      user =
        formatted_body.substring(
          formatted_body.indexOf('<a href="https://matrix.to/#/') + 29, // 29 = char length of `<a href="https://matrix.to/#/`
          formatted_body.indexOf('">')
        ) || user;
    }
  }

  let lookup = lookup_user(user);

  let user_matrix = lookup.user_matrix;
  let graim_name = lookup.graim_name;

  if (!user_matrix) {
    // not in graim's db
    if (mentioned) {
      if (user_discordId(user)) {
        // if user was bridged from Discord
          let user_discord = await guild.members.fetch(user_discordId(user)).catch((err)=>console.log(err)); // fetch the Discord user by ID
          if (user_discord.Banned)
            user_discord.unban({ reason: event.sender + ": " + reason }).catch((err)=>console.log(err));
      }
    }

    rooms.forEach((roomId) => {
        client.unbanUser(user, roomId);
    });

    let mention = await MentionPill.forUser(user); // MentionPill for aesthetics

    return client.sendMessage(roomId, {
      body: "Unbanned " + mention.text + " for reason '" + reason + "'!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "Unbanned " +
        mention.html +
        " for reason '<code>" +
        htmlEscape(reason) +
        "</code>'!",
    });
  }

  rooms.forEach((roomId) => {
      client.unbanUser(user_matrix, roomId);
  });
    let user_discord = await guild.members.fetch(user_discordId(user)).catch((err)=>console.log(err));
    if (user_discord.Banned) guild.members.unban(lookup.user_discord).catch((err)=>console.log(err));

  return client.sendMessage(roomId, {
    body: "Unbanned " + graim_name + " for reason '" + reason + "'!",
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body:
      "Unbanned " +
      graim_name +
      " for reason '<code>" +
      htmlEscape(reason) +
      "</code>'!",
  });
}
