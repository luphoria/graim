// -=- SYNTAX : ;strike <user> [reason]
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user, db, saveDB } from "../lookupUser";
import { log } from "../log";
const util = require("util");

export async function runStrikeUserCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {
  if (!lookup_user(event.sender).moderator) {
    return client.sendMessage(roomId, {
      body: "You aren't a moderator!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "You aren't a moderator!",
    });
  }

  let user = args[1] || "";
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

  if (!lookup.graim_name) {
    // not in graim db
    return client.sendMessage(roomId, {
      body: "I don't think that user is in the graim database!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "I don't think that user is in the graim database!",
    });
  }

  let reason = args.slice(2).join(" ") || "No reason specified.";

  console.log(
    util.inspect(
      db.users.filter((dbuser) => {
        return dbuser.name == lookup.graim_name;
      }),
      true,
      null,
      true
    )
  );

  db.users
    .filter((dbuser) => {
      return dbuser.name == lookup.graim_name;
    })[0]
    .strikes.push({
      time: Date.now(),
      action: "strike",
      reason: reason,
    });

  saveDB(db);

  let strikes = db.users.filter((dbuser) => {
    return dbuser.name == lookup.graim_name;
  })[0].strikes;

  log(
    {
      info: "Striked user",
      user: lookup.graim_name,
      reason: htmlEscape(reason),
      caller: event.sender,
    },
    false, client
  );

  return client.sendMessage(roomId, {
    body: `Striked ${lookup.graim_name}: ${reason}.\nCurrent strike count: ${strikes.length}`,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: `Striked ${lookup.graim_name}: ${htmlEscape(
      reason
    )}.<br/>Current strike count: ${strikes.length}`,
  });
}
