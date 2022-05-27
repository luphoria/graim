import config from "./config";
import { MatrixClient } from "matrix-bot-sdk";
import { db, lookup_user } from "./lookupUser";

export const log = (log: {}, verbose: boolean, client: MatrixClient) => {
  if (!db.logto) return false;
  let toLog = "'~' '~' '~'\n\n";
  if (verbose) {
    if (config.verbose) {
      Object.keys(log).forEach((name) => {
        switch (name) {
          case "info":
            toLog += "<b>" + log[name] + "</b>\n";
          case "caller":
            toLog +=
              "Sent by <b>" +
              (lookup_user(log[name]) + " (" + log[name] + ")" || log[name]) +
              "</b>\n";
          default:
            toLog += name + ": " + log[name] + "\n";
        }
      });
      toLog += "\n'~' '~' '~'";
      return client.sendMessage(db.logto, {
        body: toLog.replace(/<b>|<\/b>/g, ""),
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: toLog,
      });
    }
  } else {
    Object.keys(log).forEach((name) => {
      switch (name) {
        case "info":
          toLog += "<b>" + log[name] + "</b>\n";
        case "caller":
          toLog +=
            "Sent by <b>" +
            (lookup_user(log[name]) + " (" + log[name] + ")" || log[name]) +
            "</b>\n";
        default:
          toLog += name + ": " + log[name] + "\n";
      }
    });
    toLog += "\n'~' '~' '~'";
    return client.sendMessage(db.logto, {
      body: toLog.replace(/<b>|<\/b>/g, ""),
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: toLog,
    });
  }
};
