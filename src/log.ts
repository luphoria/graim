import config from "./config";
import { MatrixClient } from "matrix-bot-sdk";
import { db, lookup_user, mentionPillFor } from "./lookupUser";

export const log = async (log: {}, verbose: boolean, client: MatrixClient) => {
  try {
    if (!db.logto) return false;
    let toLog = "'~' '~' '~' '~' '~' '~' '~'\n\n";
    if (verbose) {
      if (config.verbose) {
        for (let i = 0; i < Object.keys(log).length; i++) {
          let act = Object.keys(log)[i];
          switch (act) {
            case "info":
              toLog += "<b>" + log[act] + "</b>\n";
              break;
            case "caller":
              toLog +=
                "Sent by <b>" +
                (lookup_user(log[act]).graim_name + " (" + log[act] + ")" ||
                  log[act]) +
                "</b>\n";
              break;
            case "user":
              await mentionPillFor(log[act]).then((pill) => {
                toLog += "user: " + pill.html + " (" + log[act] + ")\n";
                console.log("-------\n" + toLog);
              });
              break;
            default:
              toLog += act + ": " + log[act] + "\n";
              break;
          }
        }
        toLog += "\n'~' '~' '~' '~' '~' '~' '~'";
        console.log(toLog);
        console.log(
          toLog.replace(
            /<b>|<\/b>|<a href="https:\/\/matrix\.to\/#\/@|">(.*?)<\/a>/g,
            ""
          )
        );
        return client.sendMessage(db.logto, {
          body: toLog.replace(
            /<b>|<\/b>|<a href="https:\/\/matrix\.to\/#\/@|">(.*?)<\/a>/g,
            ""
          ),
          msgtype: "m.notice",
          format: "org.matrix.custom.html",
          formatted_body: toLog,
        });
      }
    } else {
      for (let i = 0; i < Object.keys(log).length; i++) {
        let act = Object.keys(log)[i];
        switch (act) {
          case "info":
            toLog += "<b>" + log[act] + "</b>\n";
            break;
          case "caller":
            toLog +=
              "Sent by <b>" +
              (lookup_user(log[act]).graim_name + " (" + log[act] + ")" ||
                log[act]) +
              "</b>\n";
            break;
          case "user":
            await mentionPillFor(log[act]).then((pill) => {
              toLog += "user: " + pill.html + " (" + log[act] + ")\n";
              console.log("-------\n" + toLog);
            });
            break;
          default:
            toLog += act + ": " + log[act] + "\n";
            break;
        }
      }
      toLog += "\n'~' '~' '~' '~' '~' '~' '~'";
      console.log(toLog);
      console.log(
        toLog.replace(
          /<b>|<\/b>|<a href="https:\/\/matrix\.to\/#\/@|">(.*?)<\/a>/g,
          ""
        )
      );
      return client.sendMessage(db.logto, {
        body: toLog.replace(
          /<b>|<\/b>|<a href="https:\/\/matrix\.to\/#\/@|">(.*?)<\/a>/g,
          ""
        ),
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: toLog,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
