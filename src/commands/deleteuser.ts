// -=- SYNTAX : ;deleteuser <graim_name>
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { db, lookup_user, saveDB } from "../lookupUser";
import { COMMAND_PREFIX } from "./handler";
export async function runDeleteUserCommand(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient,
  formatted_body: string
) {
  console.log(formatted_body);

  if (!lookup_user(event.sender).moderator) {
    let power_levels = await client.getRoomStateEvent(
      roomId,
      "m.room.power_levels",
      ""
    );
    console.log(power_levels);
    if (power_levels["users"]?.[event.sender] < 100) { // checks if user is an Admin
      return client.sendMessage(roomId, {
        body: "You aren't a moderator!",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: "You aren't a moderator!",
      });
    }
  }

  if (!args[1]) {
    return client.sendMessage(roomId, {
      body: "Usage: " + COMMAND_PREFIX + "deleteuser <graim_name>",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "Usage: " + COMMAND_PREFIX + "deleteuser &lt;graim_name&gt;",
    });
  }

  let lookup = lookup_user(args[1]);

  if (!lookup.graim_name) {
    return client.sendMessage(roomId, {
      body: "User " + args[1] + " doesn't seem to exist..",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "User " + htmlEscape(args[1]) + " doesn't seem to exist..",
    });
  }

  db.users.pop(
    db.users.filter((user) => {
      return user.name == lookup.graim_name;
    })
  );
  if (lookup.moderator) delete db.mods[lookup.graim_name];
  saveDB(db);

  return client.sendMessage(roomId, {
    body: `Successfully removed ${lookup.graim_name} from the graim db!`,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: `Successfully removed ${htmlEscape(
      lookup.graim_name
    )} from the graim db!`,
  });
}
