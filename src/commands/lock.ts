// TODO: log [reason]
// -=- SYNTAX : ;lock [room]
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import { lookup_user, db } from "../lookupUser";
import { guild } from "./discord_handler";

export async function runLockCommand(
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

  let commandString = args.join(" ");
  let channel = null;
  let room = roomId;

  if (args[1]) {
    commandString = formatted_body.replace(
      /<a href="https:\/\/matrix\.to\/#\/#|">(.*?)<\/a>/g,
      ""
    );
    room = await client.resolveRoom("#" + commandString.split(" ")[1]);
    console.log(room);
  }

  channel = db.rooms[room] || null;

  let power_levels = await client.getRoomStateEvent(
    room,
    "m.room.power_levels",
    ""
  );
  power_levels["events_default"] = 2; // higher than default
  client.sendStateEvent(room, "m.room.power_levels", "", power_levels);

  if (channel) {
    channel = guild.channels.cache.get(channel);
    channel.permissionOverwrites.edit(channel.guild.id, {
      SEND_MESSAGES: false,
      ATTACH_FILES: false,
    });
  }

  return client.sendMessage(room, {
    body: "Channel is locked. :(",
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: "Channel is <b>locked</b>. :(",
  });
}
