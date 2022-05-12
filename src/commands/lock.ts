// -=- SYNTAX : ;lock [room]
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import { lookup_user, db } from "../lookupUser";
import { guild } from "./discord_handler";
import { COMMAND_PREFIX } from "./handler";

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
  let cmd;
  let channel = null;
  let room = roomId;

  if (args[1]) {
    commandString = formatted_body.replace(
      /<a href="https:\/\/matrix\.to\/#\/#|">(.*?)<\/a>/g,
      ""
    );
    cmd = commandString.split(" ");
    room = await client.resolveRoom("#" + cmd[1]);
    if (!cmd[1].indexOf("_discord_")) {
      Object.entries(db.rooms).find(async ([key, value]) => {
        if (value === cmd[1].substring(10, 28)) {
          cmd[1] = key;
          room = await client.resolveRoom(cmd[1]);
        } 
      });
    }
    console.log(room);
  }

  channel = db.rooms[room] || null;
  let error = false;

  let power_levels = await client
    .getRoomStateEvent(room, "m.room.power_levels", "")
    .catch((err) => {
      console.log(err);
      error = true;
    });
  if(error) {
    return client.sendMessage(roomId, {
      body: "Something went wrong",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Something went wrong",
    });
  }
  power_levels["events_default"] = 2; // higher than default
  client
    .sendStateEvent(room, "m.room.power_levels", "", power_levels)
    .catch((err) => console.log(err));

  let warn = "";

  if (channel) {
    channel = guild.channels.cache.get(channel);
    channel.permissionOverwrites
      .edit(channel.guild.id, {
        SEND_MESSAGES: false,
        ATTACH_FILES: false,
      })
      .catch((err) => console.log(err));
  } else {
    warn =
      "\nNOTE: This room is not bridged in graim! For the lock to propagate to Discord, it must be attached to a Discord channel. See " +
      COMMAND_PREFIX +
      "bridgeroom.";
  }

  return client.sendMessage(room, {
    body: "Channel is locked. :(" + warn,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: "Channel is <b>locked</b>. :(" + warn,
  });
}
