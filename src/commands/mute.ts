import {
    MatrixClient,
    MessageEvent,
    MessageEventContent,
  } from "matrix-bot-sdk";
  import * as htmlEscape from "escape-html";
  import { lookup_user } from "../lookupUser";
  import { guild, mute_role } from "./discord_handler";
  import { COMMAND_PREFIX } from "./handler";
  const ms = require("ms");
  
  export async function runMuteCommand(
    roomId: string,
    event: MessageEvent<MessageEventContent>,
    args: string[],
    client: MatrixClient
  ) {
    if (!lookup_user(event.sender).moderator) {
      return client.sendMessage(roomId, {
        body: "You aren't a moderator!",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: "You aren't a moderator!",
      });
    }
  
    if(!args[1]) {
      return client.sendMessage(roomId, {
          body: "Usage: " + COMMAND_PREFIX + "mute <user> [time]",
          msgtype: "m.notice",
          format: "org.matrix.custom.html",
          formatted_body: "I don't think that user is in the graim database!",
        });
    }
  
    // The first argument is always going to be us, so get the second argument instead.
    let user: {
      graim_name: string;
      user_matrix: string;
      user_discord: string;
      moderator: boolean;
    };
  
    try {
      user = lookup_user(args[1]);
    } catch {
      return client.sendMessage(roomId, {
        body: "I don't think that user is in the graim database!",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: "I don't think that user is in the graim database!",
      });
    }
  
    let msToUnmute: number;

    try {
      msToUnmute = ms(args[2]);
    } catch {
      msToUnmute = ms("1d");
    }

    client.setUserPowerLevel(user.user_matrix,roomId,-1);
    let user_discord = await guild.members.fetch(user.user_discord);
    user_discord.roles.add(mute_role);
    setTimeout(() => {
      client.setUserPowerLevel(user.user_matrix,roomId,0);
      user_discord.roles.remove(mute_role);
    }, msToUnmute)
  
    return client.sendMessage(roomId, {
      body: "Muted " + user.graim_name + ".",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Muted " + htmlEscape(user.graim_name) + ".",
    });
  }
  