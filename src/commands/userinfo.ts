// -=- SYNTAX : ;userinfo <user>
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user } from "../lookupUser";
export async function runUserinfoCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient
) {
  let user;
  try {
    user = lookup_user(args[1]);
  } catch {
    // user provided no arguments - let's use their user as the arg instead
    user = lookup_user(event.sender);
  }
  if (!user.graim_name) {
    // not in graim db
    return client.sendMessage(roomId, {
      body: "I don't think that user is in the graim database!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "I don't think that user is in the graim database!",
    });
  }

  console.log(user);

  let modOnlyLookup = "";
  if (lookup_user(event.sender).moderator) {
    if (user.strikes.length > 0) {
      modOnlyLookup = "\n\nStrikes:\n";
      for (let i = 0; i < user.strikes.length; i++) {
        modOnlyLookup +=
          new Date(user.strikes[i].time).toLocaleDateString() +
          ": " +
          user.strikes[i].reason +
          " [" +
          user.strikes[i].action +
          "]\n";
      }
    }
  }

  return client.sendMessage(roomId, {
    body:
      `User: ${user.graim_name}\n` +
      `   Matrix: ${user.user_matrix}\n` +
      `   Discord: ${user.user_discord}\n` +
      `Moderator? ${user.moderator ? "Yes" : "No"}` +
      modOnlyLookup,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body:
      `User: ${htmlEscape(user.graim_name)}\n` +
      `   Matrix: ${htmlEscape(user.user_matrix)}\n` +
      `   Discord: ${htmlEscape(user.user_discord)}\n` +
      `Moderator? ${user.moderator ? "Yes" : "No"}` +
      modOnlyLookup,
  });
}
