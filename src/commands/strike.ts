// -=- SYNTAX : ;strike <user> [reason]
import { MatrixClient } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user, db, saveDB } from "../lookupUser";
const util = require("util");

export async function runStrikeUserCommand(
  roomId: string,
  args: string[],
  client: MatrixClient
) {
  let user = lookup_user(args[1]);
  if (!user.graim_name) {
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
        return dbuser.name == user.graim_name;
      }),
      true,
      null,
      true
    )
  );

  db.users
    .filter((dbuser) => {
      return dbuser.name == user.graim_name;
    })[0]
    .strikes.push({
      time: Date.now(),
      action: "strike",
      reason: reason,
    });

  saveDB(db);

  let strikes = db.users.filter((dbuser) => {
    return dbuser.name == user.graim_name;
  })[0].strikes;

  return client.sendMessage(roomId, {
    body: `Striked ${user.graim_name}: ${reason}.\nCurrent strike count: ${strikes.length}`,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: `Striked ${user.graim_name}: ${htmlEscape(reason)}.\nCurrent strike count: ${strikes.length}`,
  });
}
