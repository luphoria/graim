/*

 === TODO : don't just quit when there is no graim user ===

*/

import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, lookup_user } from "../lookupUser";
import { guild } from "./discord_handler";

export async function runKickCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {
  console.log(`=======\n${formatted_body}\n========`);

  if (!lookup_user(event.sender).moderator) {
    return client.sendMessage(roomId, {
      body: "You aren't a moderator!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "You aren't a moderator!",
    });
  }

  let MentionPill = false;
  let user = args[1] || "";
  let reason = args.slice(2).join(" ") || "No reason specified";
  if (formatted_body) {
    if (formatted_body.includes("<a href=")) {
      MentionPill = true;
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

  if (!graim_name) {
    // there is no registered graim user
    if (MentionPill) {
      if (user_discordId(user)) {
        let user_discord = await guild.members.fetch(user_discordId(user));
        if (user_discord.kickable)
          user_discord.kick(event.sender + ": " + reason);
      }
    }
    client.kickUser(
      user,
      roomId,
      event.sender + " told me to! :D => " + htmlEscape(reason)
    );
    return client.sendMessage(roomId, {
      body: "Kicked " + user + " for reason '" + reason + "'!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "Kicked " +
        user +
        " for reason '<code>" +
        htmlEscape(reason) +
        "</code>'!",
    });
  }

  client.kickUser(
    user_matrix,
    roomId,
    event.sender + " told me to! :D => " + htmlEscape(reason)
  );

  let user_discord = await guild.members.fetch(lookup.user_discord);
  if (user_discord.kickable) user_discord.kick(event.sender + ": " + reason);

  return client.sendMessage(roomId, {
    body: "Kicked " + graim_name + " for reason '" + reason + "'!",
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body:
      "Kicked " +
      graim_name +
      " for reason '<code>" +
      htmlEscape(reason) +
      "</code>'!",
  });
}
