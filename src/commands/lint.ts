// -=- SYNTAX : ;lint
import { MatrixClient } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { db } from "../lookupUser";
import { COMMAND_PREFIX, rooms } from "./handler";
import config from "../config";
export async function runLintCommand(roomId: string, client: MatrixClient) {
  // ~~ LINT ~~

  let res = "Linting list:\n\n\n";
  let totalErrors = 0;
  let totalWarns = 0;

  if (Object.keys(db.mods).length < 1) {
    res +=
      " - It seems that there is currently no moderator. To add one, use " +
      COMMAND_PREFIX +
      "adduser!\n\n";
    totalErrors += 1;
  }
  if (!db.rooms) {
    res +=
      " - It seems you haven't bridged the channels to rooms with graim. Without bridging with graimdb as well, you cannot use " +
      COMMAND_PREFIX +
      "lock. To bridge the rooms, use " +
      COMMAND_PREFIX +
      "bridgeroom!\n\n";
    totalWarns += 1;
  }
  if (!db.logto) {
    res +=
      " - It seems that there is no room for graim to log to. To add one, run the command " +
      COMMAND_PREFIX +
      "setloggingroom in whatever room/channel you would like it to log to!\n\n";
    totalWarns += 1;
  }

  if (config.autoJoin) {
    res +=
      " - It seems that autojoin is currently enabled. While there is no known vulnerability, there is a potential that graim could be exploited with it. It is recommended to disable this once you have added it to all rooms!\n\n";
    totalWarns += 1;
  }

  let graimModeratorFound = false;
  let powerLevelMisconfigureFound = false;
  for (let i = 0; i < rooms.length; i++) {
    let power_levels = await client.getRoomStateEvent(
      rooms[i],
      "m.room.power_levels",
      ""
    );
    let uidPower = power_levels["users"][await client.getUserId()];
    if (uidPower < 50) {
      if (power_levels["events_default"] <= uidPower) {
        graimModeratorFound = true;
        totalErrors += 1;
        client.sendMessage(rooms[i], {
          body: "It seems I'm not properly configured in this room! I need to be a Moderator (power level 50) in all rooms to work!",
          msgtype: "m.notice",
          format: "org.matrix.custom.html",
          formatted_body:
            "It seems I'm not properly configured in this room! I need to be a Moderator (power level 50) in all rooms to work!",
        });
      }
    }
    if (power_levels["events"]["m.room.power_levels"] > 50) {
      if (power_levels["events_default"] <= uidPower) {
        powerLevelMisconfigureFound = true;
        totalErrors += 1;
        client.sendMessage(rooms[i], {
          body: 'It seems this room is improperly configured! Edit the room permissions and alter "Change Permissions" (m.room.power_levels) to be "Moderator" (power level 50).',
          msgtype: "m.notice",
          format: "org.matrix.custom.html",
          formatted_body:
            'It seems this room is improperly configured! Edit the room permissions and alter "Change Permissions" (<code>m.room.power_levels</code>) to be "Moderator" (power level 50).',
        });
      }
    }
  }
  if (graimModeratorFound)
    res +=
      " - Certain room(s) have graim's power level below 50 (Moderator). I sent a message in each offending room. You will need to set the bot as a moderator to use it!\n\n";
  if (powerLevelMisconfigureFound)
    res +=
      ' - Certain room(s) are not properly configured for graim! The "Change permissions" setting (m.room.power_levels) must be set to "Moderator" (or power level 50 or below)! I tried to send a message in each offending room. If no messages showed up, make sure I can send messages everywhere in the first place!\n\n';

  res += "Total errors: " + totalErrors + "\nTotal warnings: " + totalWarns;

  return client.sendMessage(roomId, {
    body: res,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: htmlEscape(res),
  });
}
