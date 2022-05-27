import config from "./config";
import { MatrixClient } from "matrix-bot-sdk";
import { db, lookup_user } from "./lookupUser";

export const log = (log: {}, verbose: boolean, client: MatrixClient) => {
  try {
    if (!db.logto) return false;
    let toLog = "'~' '~' '~' '~' '~' '~' '~'\n\n";
    if (verbose) {
      if (config.verbose) {
        Object.keys(log).forEach((name) => {
          switch (name) {
            case "info":
              toLog += "<b>" + log[name] + "</b>\n";
              break;
            case "caller":
              toLog +=
                "Sent by <b>" +
                (lookup_user(log[name]).graim_name + " (" + log[name] + ")" ||
                  log[name]) +
                "</b>\n";
              break;
            default:
              toLog += name + ": " + log[name] + "\n";
              break;
          }
        });
        toLog += "\n'~' '~' '~' '~' '~' '~' '~'";
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
            break;
          case "caller":
            toLog +=
              "Sent by <b>" +
              (lookup_user(log[name]).graim_name + " (" + log[name] + ")" ||
                log[name]) +
              "</b>\n";
            break;
          default:
            toLog += name + ": " + log[name] + "\n";
            break;
        }
      });
      toLog += "\n'~' '~' '~' '~' '~' '~' '~'";
      return client.sendMessage(db.logto, {
        body: toLog.replace(/<b>|<\/b>/g, ""),
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: toLog,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
