// -=- SYNTAX : ;userinfo <user>
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user, mentionPillFor } from "../lookupUser";
import { log } from "../log";
export async function runUserinfoCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {
  let user = args[1];

  if (!args[1]) {
    user = event.sender;
  }

  if (formatted_body) {
    if (formatted_body.includes('<a href="https://matrix.to/#/')) {
      // MentionPill was provided
      user =
        formatted_body.substring(
          formatted_body.indexOf('<a href="https://matrix.to/#/') + 29, // 29 = char length of `<a href="https://matrix.to/#/`
          formatted_body.indexOf('">')
        ) || user;
    }
  }

  let lookup = lookup_user(user);

  if (!lookup.graim_name) {
    // not in graim db
    return client.sendMessage(roomId, {
      body: "I don't think that user is in the graim database!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "I don't think that user is in the graim database!",
    });
  }

  console.log(lookup);

  let modOnlyLookup = "";
  if (lookup_user(event.sender).moderator) {
    if (lookup.strikes.length > 0) {
      modOnlyLookup = "\n\nStrikes:\n";
      for (let i = 0; i < lookup.strikes.length; i++) {
        modOnlyLookup +=
          new Date(lookup.strikes[i]["time"]).toLocaleDateString() +
          ": " +
          lookup.strikes[i]["reason"] +
          " [" +
          lookup.strikes[i]["action"] +
          "]\n";
      }
    }
  }

  return client.sendMessage(roomId, {
    body: `User: ${lookup.graim_name}
   Matrix: ${lookup.user_matrix}
   Discord: ${lookup.user_discord} (${lookup.user_discord})
Moderator? ${lookup.moderator ? "Yes" : "No"}`,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: `User: ${lookup.graim_name}
   Matrix: ${htmlEscape(lookup.user_matrix)}
   Discord: ${(await mentionPillFor(lookup.user_discord)).html} (${htmlEscape(
      lookup.user_discord
    )})
Moderator? ${lookup.moderator ? "Yes" : "No"}`,
  });
}
