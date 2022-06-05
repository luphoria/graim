// -=- SYNTAX : ;bridgeroom <channel id>
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import { db, lookup_user, saveDB } from "../lookupUser";
import { COMMAND_PREFIX } from "./handler";
import { log } from "../log";
export async function runBridgeCommand(
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

    if (!args[1]) {
      // they did not reply with at least the full number of required args
      return client.sendMessage(roomId, {
        body: "Usage: " + COMMAND_PREFIX + "bridgeroom <channel id>",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body:
          "Usage: " + COMMAND_PREFIX + "bridgeroom &lt;channel id&gt;",
      });
    }

    db.rooms[roomId] = args[1]; // sync channel and room
    saveDB(db);
    log(
      {
        info: "Bridged room to channel",
        room: roomId,
        channel: args[1],
        caller: event.sender,
      },
      false,
      client
    );

    return client.sendMessage(roomId, {
      body: `Bridged ${roomId} to ${args[1]}`,
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: `Bridged ${roomId} to ${args[1]}`,
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
