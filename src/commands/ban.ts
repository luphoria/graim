// -=- SYNTAX : ;ban <user> [reason]
import {
  MatrixClient,
  MessageEvent,
  MentionPill,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, lookup_user, db, saveDB, mentionPillFor } from "../lookupUser";
import { guild } from "./discord_handler";
import { rooms } from "./handler";
import { log } from "../log";
export async function runBanCommand(
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

  let user = args[1] || "";
  let reason = args.slice(2).join(" ") || "No reason specified."; // everything after the username
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

  let user_matrix = lookup.user_matrix;
  let graim_name = lookup.graim_name;

  if (!graim_name) {
    // the lookup returned no results
    // sanity check before we try to lookup the Discord ID
    if (user_discordId(user)) {
      // if the user is a Discord-bridged one
      let user_discord = await guild.members
        .fetch(user_discordId(user))
        .catch((err) => console.error(err)); // get the discord user
      if (user_discord) {
        if (user_discord.bannable) {
          user_discord
            .ban({ reason: event.sender + ": " + reason })
            .catch((err) => console.error(err));
          log(
            {
              info: "Banned user (discord)",
              user: user + " (" + user_discordId(user) + ")",
              reason: htmlEscape(reason),
              caller: event.sender,
            },
            true,
            client
          );
        }
      }
    }
    rooms.forEach((roomId) => {
      client.banUser(
        user,
        roomId,
        event.sender + " told me to! :D => " + htmlEscape(reason)
      );
      log(
        {
          info: "Banned user (matrix)",
          user: user,
          roomId: roomId,
          reason: htmlEscape(reason),
          caller: event.sender,
        },
        true,
        client
      );
    });

    let mention = await mentionPillFor(user);

    return client.sendMessage(roomId, {
      body: "Banned " + mention.text + " for reason '" + reason + "'!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "Banned " +
        mention.html +
        " for reason '<code>" +
        htmlEscape(reason) +
        "</code>'!",
    });
  }
  rooms.forEach((roomId) => {
    client.banUser(
      user_matrix,
      roomId,
      event.sender + " told me to! :D => " + htmlEscape(reason)
    );
    log(
      {
        info: "Banned user (matrix)",
        user: user_matrix,
        roomId: roomId,
        reason: htmlEscape(reason),
        caller: event.sender,
      },
      true,
      client
    );
  });

  let user_discord = await guild.members
    .fetch(lookup.user_discord)
    .catch((err) => console.error(err)); // get the discord user
  if (user_discord) {
    if (user_discord.bannable) {
      user_discord
        .ban({ reason: event.sender + ": " + reason })
        .catch((err) => console.error(err));
      log(
        {
          info: "Banned user (discord)",
          user: user_discord,
          reason: htmlEscape(reason),
          caller: event.sender,
        },
        true,
        client
      );
    }
  }

  db.users
    .filter((dbuser) => {
      return dbuser.name == lookup.graim_name;
    })[0]
    .strikes.push({
      time: Date.now(),
      action: "ban",
      reason: reason,
    });

  saveDB(db);

  let strikes = db.users.filter((dbuser) => {
    return dbuser.name == lookup.graim_name;
  })[0].strikes;

  log(
    {
      info: "Banned user",
      user: lookup.graim_name,
      reason: htmlEscape(reason),
      caller: event.sender,
    },
    false,
    client
  );

  return client.sendMessage(roomId, {
    body:
      "Banned " +
      graim_name +
      " for reason '" +
      reason +
      "'!\nCurrent strikes: " +
      strikes.length,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body:
      "Banned " +
      graim_name +
      " for reason '<code>" +
      htmlEscape(reason) +
      "</code>'!<br/>Current strikes: " +
      strikes.length,
  });
}
