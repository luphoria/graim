/*

 === TODO : DISCORD ===
 === TODO :   AUTH  ===

*/

import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user } from "../lookupUser";
import { guild } from "./discord_handler";

export async function runUnbanCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {
  console.log(`=======\n${formatted_body}\n========`);

  let user = args[1] || "";
  let reason = args.slice(2).join(" ") || "No reason specified";
  if (formatted_body) {
    if (formatted_body.includes("<a href=")) {
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
    return client.sendMessage(roomId, {
      body: "I couldn't seem to find that user in my database, sorry D:",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "I couldn't seem to find that user in my database, sorry D:",
    });
  }

  // Now send that message as a notice

  client.unbanUser(user_matrix, roomId);
  guild.members.unban(lookup.user_discord);

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
