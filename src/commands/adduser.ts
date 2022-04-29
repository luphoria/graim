// -=- SYNTAX : ;adduser <graim_name> <@matrix_name> <@discord_name> [moderator]
import {
  MatrixClient,
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
  try {
    if (!lookup_user(event.sender).moderator) {
      return client.sendMessage(roomId, {
        body: "You aren't a moderator!",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: "You aren't a moderator!",
      });
    }

    if (!args[3]) {
      // they did not reply with at least the full number of required args
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
      // this command is intentionally designed to only work with MentionPills, and discord users can't MentionPill a matrix user
      return client.sendMessage(roomId, {
        body: "Please run this command as a Matrix user!",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: "Please run this command as a Matrix user!",
      });
    }

    let command;

    if (formatted_body) {
      // simple sanity check - MentionPill requires formatted body. This isn't really necessary
      if (formatted_body.includes('<a href="https://matrix.to/#/')) {
        // sort-of hacky, but this is just HTML for mentionpill
        command = formatted_body
          .replace(/<a href="https:\/\/matrix\.to\/#\/|">(.*?)<\/a>/g, "") // REGEX: removes all content from MentionPill HTML except the MXID
          .split(" ");
      } else {
        // there was no MentionPill
        return client.sendMessage(roomId, {
          body: 'Please mention the users with a "mention pill"!',
          msgtype: "m.notice",
          format: "org.matrix.custom.html",
          formatted_body: 'Please mention the users with a "mention pill"!',
        });
      }
    } else {
      // there was no formatted body - so no mentionpill
      return client.sendMessage(roomId, {
        body: 'Please mention the users with a "mention pill"!',
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: 'Please mention the users with a "mention pill"!',
      });
    }

    let user = {
      name: command[1],
      matrix: command[2].slice(1), // don't store the `@` of Matrix users in the db
      discord: user_discordId(command[3]),
    };
    let moderator = command[4] == "moderator" ? true : false; // TODO: make a real ranking for admins vs. moderators

    if (lookup_user(user.name).graim_name) {
      return client.sendMessage(roomId, {
        body: "User " + user.name + " already exists!",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: "User " + htmlEscape(user.name) + " already exists!",
      });
    }

    db.users.push(user); // add user object to the existing db list
    if (moderator) db.mods[user.name] = "Moderator"; // add username to moderator list
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
  } catch {
    return client.sendMessage(roomId, {
      body: "Something went wrong running this command",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Something went wrong running this command",
    });
  }
}
