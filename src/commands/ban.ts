// -=- SYNTAX : ;ban <user> [reason]
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

  let mentioned = false; // did the user provide a MentionPill or a plain-text@messa.ge?
  let user = args[1] || "";
  let reason = args.slice(2).join(" ") || "No reason specified"; // everything after the username
  if (formatted_body) {
    if (formatted_body.includes('<a href="https://matrix.to/#/')) {
      // MentionPill was provided
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

  if (!graim_name) {
    // the lookup returned no results
    if (mentioned) {
      // sanity check before we try to lookup the Discord ID
      if (user_discordId(user)) {
        // if the user is a Discord-bridged one
        try {
          let user_discord = await guild.members.fetch(user_discordId(user)); // get the discord user
          if (user_discord.bannable)
            user_discord.ban({ reason: event.sender + ": " + reason });
        } catch {}
      }
    }
    rooms.forEach((roomId) => {
      client.banUser(
        user,
        roomId,
        event.sender + " told me to! :D => " + htmlEscape(reason)
      );
    });

    let mention = await MentionPill.forUser(user); // creates a MentionPill for aesthetics

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
  });

  try {
    let user_discord = await guild.members.fetch(lookup.user_discord); // get the discord user
    if (user_discord.bannable)
      user_discord.ban({ reason: event.sender + ": " + reason });
  } catch {}

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


  return client.sendMessage(roomId, {
    body: "Banned " + graim_name + " for reason '" + reason + "'!\nCurrent strikes: " + strikes.length,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body:
      "Banned " +
      graim_name +
      " for reason '<code>" +
      htmlEscape(reason) +
      "</code>'!\nCurrent strikes: " + strikes.length,
  });
}
