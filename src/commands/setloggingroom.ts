// -=- SYNTAX : ;bridgeroom <channel id>
import {
    MatrixClient,
    MessageEvent,
    MessageEventContent,
  } from "matrix-bot-sdk";
  import { db, lookup_user, saveDB } from "../lookupUser";
  import { log } from "../log";
  export async function runSetLoggingRoomCommand(
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

      db.logto = roomId;
      saveDB(db);
      log(
        {
          info: "Set logging room",
          room: roomId,
          caller: event.sender,
        },
        false, client
      );

      return client.sendMessage(roomId, {
        body: `Set logging channel to ${roomId}`,
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: `Set logging channel to ${roomId}`,
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
  