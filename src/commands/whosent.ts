// -=- SYNTAX : ;whosent <https://discord.com/channels/[guild]/[channel]/[message]>
import { MatrixClient } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { guild } from "./discord_handler";
import { COMMAND_PREFIX } from "./handler";

export async function runWhoSentCommand(
  roomId: string,
  args: string[],
  client: MatrixClient
) {
  try {
    if (!args[1]) {
      // user didn't provide the required number of arguments
      return client.sendMessage(roomId, {
        body: "Usage: " + COMMAND_PREFIX + "whosent <Discord URL to message>",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body:
          "Usage: " + COMMAND_PREFIX + "whosent <Discord URL to message>",
      });
    }
    let command = args[1].split("/"); // just an easy way to parse the URL
    let input = {
      guild: command[4],
      channel: command[5],
      message: command[6],
    };
    let channel = guild.channels.cache.get(input.channel); // fetch the channel from ID
    let msg = await channel.messages.fetch(input.message); // fetch the message from the channel by ID

    client.sendMessage(roomId, {
      // give some reception while the user waits - search api takes time
      body: `Searching . . .`,
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: `Searching . . .`,
    });

    let possibleMatches = [];

    const members = await client.getRoomMembers(roomId);
    for (let member of members) {
      if (member.content.displayname == msg.author.username) {
        possibleMatches.push(member.sender.slice(1));
      }
    }

    let ret: string;
    if (possibleMatches.length > 0) {
      ret = "Matches: " + possibleMatches.join(", ");
    } else {
      ret = "Sorry, but the query returned no results :(\nYou'll probably have to log on Matrix for this one.";
    }
    return client.sendMessage(roomId, {
      body: ret,
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: htmlEscape(ret),
    });
  } catch {
    return client.sendMessage(roomId, {
      body: "Something went wrong running this command",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Something went wrong running this command",
    });
  }
}
