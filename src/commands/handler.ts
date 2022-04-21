import { LogService, MatrixClient, MessageEvent, RichReply, UserID } from "matrix-bot-sdk";
import { runHelloCommand } from "./hello";
import { runKickCommand } from "./kick";
import { runBanCommand } from "./ban";
import { runUnbanCommand } from "./unban";

import * as htmlEscape from "escape-html";

// The prefix required to trigger the bot. The bot will also respond
// to being pinged directly.
export const COMMAND_PREFIX = ";";

// This is where all of our commands will be handled
export default class CommandHandler {

    // Just some variables so we can cache the bot's display name and ID
    // for command matching later.
    private displayName: string;
    private userId: string;
    private localpart: string;

    constructor(private client: MatrixClient) {
    }

    public async start() {
        // Populate the variables above (async)
        await this.prepareProfile();

        // Set up the event handler
        this.client.on("room.message", this.onMessage.bind(this));
    }

    private async prepareProfile() {
        this.userId = await this.client.getUserId();
        this.localpart = new UserID(this.userId).localpart;

        try {
            const profile = await this.client.getUserProfile(this.userId);
            if (profile && profile['displayname']) this.displayName = profile['displayname'];
        } catch (e) {
            // Non-fatal error - we'll just log it and move on.
            LogService.warn("CommandHandler", e);
        }
    }

    private async onMessage(roomId: string, ev: any) {
        const event = new MessageEvent(ev);
        if (event.isRedacted) return; // Ignore redacted events that come through
        if (event.sender === this.userId) return; // Ignore ourselves
        if (event.messageType !== "m.text") return; // Ignore non-text messages

        // Ensure that the event is a command before going on. We allow people to ping
        // the bot as well as using our COMMAND_PREFIX.
        const prefixes = [COMMAND_PREFIX, `${this.localpart}:`, `${this.displayName}:`, `${this.userId}:`];
        const prefixUsed = prefixes.find(p => event.textBody.startsWith(p));
        if (!prefixUsed) return; // Not a command (as far as we're concerned)

        // Check to see what the arguments were to the command
        const args = event.textBody.substring(prefixUsed.length).trim().split(' ');
        const formatted_body = (event.content?.["format"] === "org.matrix.custom.html" ? event.content?.["formatted_body"] : null);
        // Try and figure out what command the user ran, defaulting to help
        try {
            switch(args[0]) {
                case "hello":
                    runHelloCommand(roomId, event, args, this.client);
                    break;
                case "kick":
                    runKickCommand(roomId, event, args, this.client, formatted_body);
                    break;
                case "ban":
                    runBanCommand(roomId, event, args, this.client, formatted_body);
                    break;
                case "unban":
                    runUnbanCommand(roomId, event, args, this.client, formatted_body);
                    break;
                case "help":
                    const help = "" +
                    "; hello [user:graim/matrix/discord]     - Say hello to a user.\n" +
                    "; kick [user:graim/matrix/discord]     -  Kick a user.\n" +

                    "; ban [user:graim/matrix/discord]     -  Ban a user.\n" +
                    "; unban [user:graim/matrix/discord]     -  Unban a user.\n" +
                    "; mute [user:graim/matrix/discord]     -  Mute a user.\n" +
                    "; createuser [user:any] [@matrix:example.org] [discord:ID/@mention]     -  Creates a user in the graim database.\n" +
                    "; whosent [message:discord url]     -  Reveals the graim user behind the message a user from Matrix sent.\n" +
                    
                    "; help             - This menu\n";

                    const text = `Help menu:\n${help}`;
                    const html = `<b>Help menu:</b><br /><pre><code>${htmlEscape(help)}</code></pre>`;
                    const reply = RichReply.createFor(roomId, ev, text, html); // Note that we're using the raw event, not the parsed one!
                    reply["msgtype"] = "m.notice"; // Bots should always use notices
                    return this.client.sendMessage(roomId, reply);
            }
        } catch (e) {
            // Log the error
            LogService.error("CommandHandler", e);

            // Tell the user there was a problem
            const message = "There was an error processing your command";
            return this.client.replyNotice(roomId, ev, message);
        }
    }
}
