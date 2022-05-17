import config from "./config"
import { MatrixClient } from "matrix-bot-sdk";
import { db } from "./lookupUser";

export const log = (log: {}, verbose: boolean, client: MatrixClient) => {
    if(!db.logto) return false;
    console.log("= = = = = = = = = = = = = = = =");
    let toLog = "- - -";
    if(verbose) {
        if(config.verbose) {
            Object.keys(log).forEach(name => {
                toLog += name + ": " + log[name] + "\n";
            });
            toLog += "- - -";
            client.sendNotice(db.logto,toLog);
        }
    } else {
        Object.keys(log).forEach(name => {
            toLog += name + ": " + log[name] + "\n";
        });
        toLog += "- - -";
        client.sendNotice(db.logto,toLog);
    }
    console.log("= = = = = = = = = = = = = = = =");
}