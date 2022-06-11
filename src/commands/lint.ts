// -=- SYNTAX : ;lint
import {
    MatrixClient,
    MessageEvent,
    MessageEventContent,
  } from "matrix-bot-sdk";
  import * as htmlEscape from "escape-html";
  import { db } from "../lookupUser";
import { COMMAND_PREFIX } from "./handler";
import config from "../config";
  export async function runLintCommand(
    roomId: string,
    client: MatrixClient,
  ) {
    // ~~ LINT ~~

    let res = "Linting list:\n\n\n";
    let totalErrors = 0;
    let totalWarns = 0;

    if(Object.keys(db.mods).length < 1) {
        res += "It seems that there is currently no moderator. To add one, use " + COMMAND_PREFIX + "adduser!\n\n";
        totalErrors += 1;
    }
    if(!db.rooms) {
        res += "It seems you haven't bridged the channels to rooms with graim. Without bridging with graimdb as well, you cannot use " + COMMAND_PREFIX + "lock. To bridge the rooms, use " + COMMAND_PREFIX + "bridgeroom!\n\n";
        totalWarns += 1;
    }
    if(!db.logto) {
        res += "It seems that there is no room for graim to log to. To add one, run the command " + COMMAND_PREFIX + "setloggingroom in whatever room/channel you would like it to log to!\n\n";
        totalWarns += 1;
    }
    
    if(config.autoJoin) {
        res += "It seems that autojoin is currently enabled. While there is no known vulnerability, there is a potential that graim could be exploited with it. It is recommended to disable this once you have added it to all rooms!\n\n";
        totalWarns += 1;
    }

    res += "Total errors: " + totalErrors + "\nTotal warnings: " + totalWarns;

    return client.sendMessage(roomId, {
      body: res,
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: htmlEscape(res),
    });
  }
  