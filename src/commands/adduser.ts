// -=- SYNTAX : ;adduser <graim_name> <@matrix_name> <@discord_name> [moderator]
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, db, lookup_user, saveDB } from "../lookupUser";
import { COMMAND_PREFIX } from "./handler";
import { log } from "../log";
export async function runAddUserCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {
  console.log(formatted_body);
  log({ INFO: "User " + event.sender + " ran command adduser." }, true, client);
  try {
    if (!lookup_user(event.sender).moderator) {
      let power_levels = await client.getRoomStateEvent(
        roomId,
        "m.room.power_levels",
        ""
      );
      console.log(power_levels["users"]);
      if (
        power_levels["users"]?.[event.sender] < 100 ||
        !power_levels["users"][event.sender]
      ) {
        // checks if user is an Admin
        return client.sendMessage(roomId, {
          body: "You aren't a moderator!",
          msgtype: "m.notice",
          format: "org.matrix.custom.html",
          formatted_body: "You aren't a moderator!",
        });
      }
      if (Object.keys(db.mods).length > 0) {
        // make sure a malicious user cannot hax with autojoin on
        return client.sendMessage(roomId, {
          body: "It seems that there is already a moderator in the database.\nIf this is a mistake, please manually clear graimdb.json",
          msgtype: "m.notice",
          format: "org.matrix.custom.html",
          formatted_body:
            "It seems that there is already a moderator in the database.<br/>If this is a mistake, please manually clear graimdb.json",
        });
      }
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

    let command = event.content.body.split(" ");

    if (formatted_body) {
      // simple sanity check - MentionPill requires formatted body. This isn't really necessary
      if (formatted_body.includes('<a href="https://matrix.to/#/')) {
        // sort-of hacky, but this is just HTML for mentionpill
        command = formatted_body
          .replace(/<a href="https:\/\/matrix\.to\/#\/|">(.*?)<\/a>/g, "") // REGEX: removes all content from MentionPill HTML except the MXID
          .split(" ");
      }
    }

    let user = {
      name: command[1],
      matrix: command[2].replace("@", ""), // don't store the `@` of Matrix users in the db
      discord: user_discordId(command[3]),
      strikes: [],
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

    log(
      {
        info: "Added user",
        user: user.name,
        matrix: user.matrix,
        discord: user.discord,
        moderator: moderator ? "Yes" : "No",
        caller: event.sender,
      },
      false, client
    );

    return client.sendMessage(roomId, {
      body:
        `User: ${user.name}\n` +
        `   Matrix: @${user.matrix}\n` +
        `   Discord: ${user.discord}\n` +
        `Moderator? ${moderator ? "Yes" : "No"}`,
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        `User: ${htmlEscape(user.name)}<br/>` +
        `   Matrix: @${htmlEscape(user.matrix)}<br/>` +
        `   Discord: ${htmlEscape(user.discord)}<br/>` +
        `Moderator? ${moderator ? "Yes" : "No"}`,
    });
  } catch (err) {
    console.log(err);
    return client.sendMessage(roomId, {
      body: "Something went wrong running this command",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Something went wrong running this command",
    });
  }
}
