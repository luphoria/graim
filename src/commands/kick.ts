// -=- SYNTAX : ;kick <user> [reason]
import {
  MatrixClient,
  MessageEvent,
  MentionPill,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, lookup_user, db, saveDB } from "../lookupUser";
import { guild } from "./discord_handler";
import { rooms } from "./handler";
import { log } from "../log";
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

  let user = args[1] || "";
  let reason = args.slice(2).join(" ") || "No reason specified.";
  if (formatted_body) {
    // sanity check - MentionPill cannot exist without a formatted body
    if (formatted_body.includes('<a href="https://matrix.to/#/')) {
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
    if (user_discordId(user)) {
      // if mention was a valid Discord user ID
      let user_discord = await guild.members
        .fetch(user_discordId(user))
        .catch((err) => console.log(err)); // fetch discord user
        if(user_discord) {
          if (user_discord.kickable) {
            user_discord
              .kick(event.sender + ": " + reason)
              .catch((err) => console.log(err));
            log(
              {
                info: "Kicked user (discord)",
                user:  user + " (" + user_discordId(user) + ")",
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
      client.kickUser(
        user,
        roomId,
        event.sender + " told me to! :D => " + htmlEscape(reason)
      );
      log(
        {
          info: "Kicked user (matrix)",
          user: user,
          reason: htmlEscape(reason),
          caller: event.sender,
        },
        true,
        client
      );
    });

    let mention = await MentionPill.forUser(user); // create mention pill for aesthetics

    return client.sendMessage(roomId, {
      body: "Kicked " + mention.text + " for reason '" + reason + "'!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "Kicked " +
        mention.html +
        " for reason '<code>" +
        htmlEscape(reason) +
        "</code>'!",
    });
  }

  rooms.forEach((roomId) => {
    client.kickUser(
      user_matrix,
      roomId,
      event.sender + " told me to! :D => " + htmlEscape(reason)
    );
    log(
      {
        info: "Kicked user (matrix)",
        user: user_matrix,
        reason: htmlEscape(reason),
        caller: event.sender,
      },
      true,
      client
    );
  });

  let user_discord = await guild.members
    .fetch(lookup.user_discord)
    .catch((err) => console.log(err)); // fetch discord user
  if (user_discord.kickable) {
    user_discord
      .kick(event.sender + ": " + reason)
      .catch((err) => console.log(err));
    log(
      {
        info: "Kicked user (discord)",
        user: lookup.graim_name + " (" + lookup.user_discord + ")",
        reason: htmlEscape(reason),
        caller: event.sender,
      },
      true,
      client
    );
  }
  db.users
    .filter((dbuser) => {
      return dbuser.name == lookup.graim_name;
    })[0]
    .strikes.push({
      time: Date.now(),
      action: "kick",
      reason: reason,
    });

  saveDB(db);

  log(
    {
      info: "Kicked user",
      user: lookup.graim_name,
      reason: htmlEscape(reason),
      caller: event.sender,
    },
    false,
    client
  );

  let strikes = db.users.filter((dbuser) => {
    return dbuser.name == lookup.graim_name;
  })[0].strikes;

  return client.sendMessage(roomId, {
    body:
      "Kicked " +
      graim_name +
      " for reason '" +
      reason +
      "'!\nCurrent strike count: " +
      strikes.length,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body:
      "Kicked " +
      graim_name +
      " for reason '<code>" +
      htmlEscape(reason) +
      "</code>'!<br/>Current strike count: " +
      strikes.length,
  });
}
