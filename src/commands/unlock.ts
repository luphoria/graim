// -=- SYNTAX : ;unlock [room]
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import { lookup_user, db } from "../lookupUser";
import { guild } from "./discord_handler";
import { log } from "../log";
export async function runUnlockCommand(
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
  let cmd;
  let channel = null;
  let room = roomId;

  if (args[1]) {
    commandString = formatted_body.replace(
      /<a href="https:\/\/matrix\.to\/#\/#|">(.*?)<\/a>/g,
      ""
    );
    cmd = commandString.split(" ");
    room = (await client.resolveRoom("#" + cmd[1])) || null;
    console.log(cmd);
    if (!cmd[1].indexOf("_discord_")) {
      cmd[1] = Object.keys(db.rooms).find(key => db.rooms[key] === cmd[1].substring(28,46));
      room = (await client.resolveRoom(cmd[1])) || null;
    }
  }
  channel = db.rooms[room] || null;
  console.log(channel);
  console.log(room);
  let error = false;

  let power_levels = await client
    .getRoomStateEvent(room, "m.room.power_levels", "")
    .catch((err) => {
      console.log(err);
      error = true;
    });
  if (error) {
    return client.sendMessage(roomId, {
      body: "Something went wrong",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Something went wrong",
    });
  }
  power_levels["events_default"] = 0; // default
  client
    .sendStateEvent(room, "m.room.power_levels", "", power_levels)
    .catch((err) => console.log(err));

  if (channel) {
    channel = guild.channels.cache.get(channel);
    channel.permissionOverwrites
      .edit(channel.guild.id, {
        SEND_MESSAGES: true,
        ATTACH_FILES: true,
      })
      .catch((err) => console.log(err));
  }

  log(
    {
      info: "Unlocked room",
      channel: channel || null,
      room: room,
      caller: event.sender,
    },
    false, client
  );

  return client.sendMessage(room, {
    body: "Channel is unlocked. :)",
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: "Channel is <b>unlocked</b>. :)",
  });
}
