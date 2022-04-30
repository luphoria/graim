// -=- SYNTAX : ;strike <user> [reason]
import { MatrixClient } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user, db, saveDB } from "../lookupUser";
const util = require("util");

export async function runClearStrikesCommand(
  roomId: string,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {

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
    .strikes = [];

  saveDB(db);

  let strikes = db.users.filter((dbuser) => {
    return dbuser.name == lookup.graim_name;
  })[0].strikes;

  return client.sendMessage(roomId, {
    body: `Cleared all strikes for ${lookup.graim_name}.\nCurrent strike count: ${strikes.length}`,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: `Cleared all strikes for ${lookup.graim_name}.\nCurrent strike count: ${strikes.length}`,
  });
}
