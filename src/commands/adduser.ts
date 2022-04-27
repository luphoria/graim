// -=- SYNTAX : ;adduser <graim_name>[1] <@matrix_name> <@discord_name> [moderator][4]
import {
  MatrixClient,
  MentionPill,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, db, lookup_user, saveDB } from "../lookupUser";
import { COMMAND_PREFIX } from "./handler";
export async function runAddUserCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {
  console.log(formatted_body);

  if (!lookup_user(event.sender).moderator) {
    return client.sendMessage(roomId, {
      body: "You aren't a moderator!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "You aren't a moderator!",
    });
  }

  if (!args[3]) {
    return client.sendMessage(roomId, {
      body:
        "Usage: " +
        COMMAND_PREFIX +
        "adduser <graim_name> <@matrix_user> <@discord_user> [moderator]",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "Usage: " +
        COMMAND_PREFIX +
        "adduser &lt;graim_name&gt; &lt;@matrix_user&gt; &lt;@discord_user&gt; [moderator]",
    });
  }

  if (user_discordId(event.sender)) {
    // please run this command from a Matrix account!
    return client.sendMessage(roomId, {
      body: "Please run this command as a Matrix user!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Please run this command as a Matrix user!",
    });
  }

  let command;

  if (formatted_body) {
    if (formatted_body.includes('<a href="https://matrix.to/#/')) {
      command = formatted_body
        .replace(/<a href="https:\/\/matrix.to\/#\/|">(.*?)<\/a>/g, "")
        .split(" ");
    } else {
      return client.sendMessage(roomId, {
        body: 'Please mention the users with a "mention pill"!',
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: 'Please mention the users with a "mention pill"!',
      });
    }
  } else {
    return client.sendMessage(roomId, {
      body: 'Please mention the users with a "mention pill"!',
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: 'Please mention the users with a "mention pill"!',
    });
  }

  let user = {
    name: command[1],
    matrix: command[2].substring(1),
    discord: user_discordId(command[3]),
  };
  let moderator = command[4] == "moderator" ? true : false;

  if (lookup_user(user.name).graim_name) {
    return client.sendMessage(roomId, {
      body: "User " + user.name + " already exists!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "User " + htmlEscape(user.name) + " already exists!",
    });
  }

  db.users.push(user);
  if (moderator) db.mods[user.name] = "Moderator";
  saveDB(db);

  return client.sendMessage(roomId, {
    body:
      `User: ${user.name}\n` +
      `   Matrix: @${user.matrix}\n` +
      `   Discord: ${user.discord}\n` +
      `Moderator? ${moderator ? "Yes" : "No"}`,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body:
      `User: ${htmlEscape(user.name)}\n` +
      `   Matrix: ${htmlEscape(user.matrix)}\n` +
      `   Discord: ${htmlEscape(user.discord)}\n` +
      `Moderator? ${moderator ? "Yes" : "No"}`,
  });
}
