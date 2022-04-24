import { MatrixClient, MentionPill, MessageEvent, MessageEventContent } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { lookup_user } from "../lookupUser";
export async function runHelloCommand(roomId: string, event: MessageEvent<MessageEventContent>, args: string[], client: MatrixClient) {
    // The first argument is always going to be us, so get the second argument instead.
    let sayHelloTo = args[1];
    if (!sayHelloTo) sayHelloTo = lookup_user(event.sender).graim_name;

    let text = `Hello ${sayHelloTo}!`;
    let html = `Hello ${htmlEscape(sayHelloTo)}!`;

    // Now send that message as a notice
    return client.sendMessage(roomId, {
        body: text,
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: html,
    });
}
