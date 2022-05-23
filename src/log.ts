import config from "./config";
import { MatrixClient } from "matrix-bot-sdk";
import { db } from "./lookupUser";

export const log = (log: {}, verbose: boolean, client: MatrixClient) => {
  if (!db.logto) return false;
  console.log("= = = = = = = = = = = = = = = =");
  let toLog = "- - -\n\n";
  if (verbose) {
    if (config.verbose) {
      Object.keys(log).forEach((name) => {
        if (name == "info") {
          toLog += "<b>" + log[name] + "</b>\n";
        } else {
          toLog += name + ": " + log[name] + "\n";
        }
      });
      toLog += "\n- - -";
      return client.sendMessage(db.logto, {
        body: toLog.replace(/<b>|<\/b>/g, ""),
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: toLog,
      });
    }
  } else {
    Object.keys(log).forEach((name) => {
      if (name == "info") {
        toLog += "<b>" + log[name] + "</b>\n";
      } else {
        toLog += name + ": " + log[name] + "\n";
      }
    });
    toLog += "\n- - -";
    return client.sendMessage(db.logto, {
      body: toLog.replace(/<b>|<\/b>/g, ""),
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: toLog,
    });
  }
  console.log("= = = = = = = = = = = = = = = =");
};
