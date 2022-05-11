// -=- SYNTAX : ;unbridgeroom
import {
    MatrixClient,
    MessageEvent,
    MessageEventContent,
  } from "matrix-bot-sdk";
  import { db, lookup_user, saveDB } from "../lookupUser";
  export async function runUnbridgeCommand(
    roomId: string,
    event: MessageEvent<MessageEventContent>,
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

      delete db.rooms[roomId]; // sync channel and room
      saveDB(db);
  
      return client.sendMessage(roomId, {
        body: `Removed bridge for ${roomId}`,
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: `Removed bridge for ${roomId}`,
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
  