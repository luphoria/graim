// -=- SYNTAX : ;whois <display name>
import { MatrixClient } from "matrix-bot-sdk";
import { COMMAND_PREFIX } from "./handler";
import * as htmlEscape from "escape-html";

export async function runWhoIsCommand(
  roomId: string,
  args: string[],
  client: MatrixClient
) {
  try {
    if (!args[1]) {
      // user didn't provide the required number of arguments
      return client.sendMessage(roomId, {
        body: "Usage: " + COMMAND_PREFIX + "whois <Matrix display name>",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body:
          "Usage: " + COMMAND_PREFIX + "whois <Matrix display name",
      });
    }

    const aliasName = args[1].trim();
    let possibleMatches = [];

    const members = await client.getRoomMembers(roomId);
    for (let member of members) {
      if (member.content.displayname == aliasName) {
        possibleMatches.push(member.sender.slice(1));
      }
    }

    let ret: string;
    if (possibleMatches.length > 0) {
      ret = "Matches: " + possibleMatches.join(", ");
    } else {
      ret = "No member found with display name: '" + aliasName + "'";
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
