// TODO: add [reason]
// -=- SYNTAX : ;unmute <user>
import {
  MatrixClient,
  MentionPill,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { user_discordId, lookup_user } from "../lookupUser";
import { guild, mute_role } from "./discord_handler";
import { COMMAND_PREFIX, rooms } from "./handler";
import { log } from "../log";
export async function runUnmuteCommand(
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

  if (!args[1]) {
    // user didn't provide the required number of args
    return client.sendMessage(roomId, {
      body: "Usage: " + COMMAND_PREFIX + "unmute <user>",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Usage: " + COMMAND_PREFIX + "unmute &lt;user&gt;",
    });
  }
  let commandString = args.join(" ");
  if (formatted_body) {
    commandString = formatted_body.replace(
      /<a href="https:\/\/matrix\.to\/#\/@|">(.*?)<\/a>/g,
      ""
    );
  }

  let command = commandString.split(" ");

  let reason = command.slice(2).join(" ") || "No reason specified.";
  let user = command[1] || ""; // we default to an empty string because it causes non-fatal errors.

  let lookup: {
    graim_name: string;
    user_matrix: string;
    user_discord: string;
    moderator: boolean;
  };

  lookup = lookup_user(user);

  if (!lookup.graim_name) {
    if (user_discordId(user)) {
      let user_discord = await guild.members
        .fetch(user_discordId(user))
        .catch((err) => console.log(err));
      if (user_discord)
        user_discord.roles.remove(mute_role).catch((err) => console.log(err));
    }

    rooms.forEach((roomId) => {
      client.setUserPowerLevel(user, roomId, 0);
    });

    let mention = await MentionPill.forUser(user);

    log(
      {
        info: "Unmuted user",
        user: user,
        reason: htmlEscape(reason),
        caller: event.sender,
      },
      false, client
    );

    return client.sendMessage(roomId, {
      body: "Unmuted " + mention.text + " for reason " + reason + "!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
        "Unmuted " +
        mention.html +
        " for reason <code>" +
        htmlEscape(reason) +
        "</code>!",
    });
  }

  try {
    lookup_user(args[1]);
  } catch {
    return client.sendMessage(roomId, {
      body: "I don't think that user is in the graim database!",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "I don't think that user is in the graim database!",
    });
  }
  rooms.forEach((roomId) => {
    client.setUserPowerLevel(lookup.user_matrix, roomId, 0);
  });

  let user_discord = await guild.members
    .fetch(lookup.user_discord)
    .catch((err) => console.log(err));
  user_discord.roles.remove(mute_role).catch((err) => console.log(err));

  log(
    {
      info: "Unmuted user",
      user: lookup.graim_name,
      reason: htmlEscape(reason),
      caller: event.sender,
    },
    false, client
  );

  return client.sendMessage(roomId, {
    body: "Unmuted " + lookup.graim_name + " for reason " + reason + "!",
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body:
      "Unmuted " +
      lookup.graim_name +
      " for reason <code>" +
      htmlEscape(reason) +
      "</code>!",
  });
}
