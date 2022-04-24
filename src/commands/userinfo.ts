import { MatrixClient, MentionPill, MessageEvent, MessageEventContent } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user } from "../lookupUser";
export async function runUserinfoCommand(roomId: string, event: MessageEvent<MessageEventContent>, args: string[], client: MatrixClient) {
    // The first argument is always going to be us, so get the second argument instead.
    let user;
    try {
        user = lookup_user(args[1]);
    } catch {
        user = lookup_user(event.sender);
    }
    if (!user.graim_name) {
        return client.sendMessage(roomId, {
            body: "I don't think that user is in the graim database!",
            msgtype: "m.notice",
            format: "org.matrix.custom.html",
            formatted_body: "I don't think that user is in the graim database!",
        });
    }

    return client.sendMessage(roomId, {
        body:
        `User: ${user.graim_name}\n` +
        `   Matrix: ${user.user_matrix}\n` +
        `   Discord: ${user.user_discord}\n` +
        `Moderator? ${user.moderator ? "Yes" : "No"}`,
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body:
        `User: ${htmlEscape(user.graim_name)}\n` +
        `   Matrix: ${htmlEscape(user.user_matrix)}\n` +
        `   Discord: ${htmlEscape(user.user_discord)}\n` +
        `Moderator? ${user.moderator ? "Yes" : "No"}`,
    });
}
