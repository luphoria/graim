// -=- SYNTAX : ;whosent <https://discord.com/channels/[guild]/[channel]/[message]>
import { MatrixClient } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { guild } from "./discord_handler";
import { COMMAND_PREFIX } from "./handler";

export async function runWhoSentCommand(
  roomId: string,
  args: string[],
  client: MatrixClient
) {
  try {
    if (!args[1]) {
      // user didn't provide the required number of arguments
      return client.sendMessage(roomId, {
        body: "Usage: " + COMMAND_PREFIX + "whosent <Discord URL to message>",
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body:
          "Usage: " + COMMAND_PREFIX + "whosent <Discord URL to message>",
      });
    }
    let command = args[1].split("/"); // just an easy way to parse the URL
    let input = {
      guild: command[4],
      channel: command[5],
      message: command[6],
    };
    let channel = guild.channels.cache.get(input.channel); // fetch the channel from ID
    let msg = await channel.messages.fetch(input.message); // fetch the message from the channel by ID

    console.log(msg.author.username + ": " + msg.content);

    client.sendMessage(roomId, {
      // give some reception while the user waits - search api takes time
      body: `Searching . . .`,
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: `Searching . . .`,
    });

    let search = await client.doRequest(
      // there is no search function in the Matrix bot SDK so we are directly fetching from API.
      "POST",
      "/_matrix/client/r0/search",
      undefined,
      {
        search_categories: {
          room_events: {
            search_term: msg.content.replace(
              /[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/g,
              " "
            ), // REGEX: search api doesn't really like special characters, so let's sanitize it for better results.
            filter: { limit: 1 },
            order_by: "recent",
            event_context: {
              before_limit: 0,
              after_limit: 0,
              include_profile: true,
            },
          },
        },
      }
    );

    let sender_mxid: string;

    try {
      // get the sender of the first result of that search
      sender_mxid =
        search["search_categories"]["room_events"]["results"][0]["result"][
          "sender"
        ];
    } catch {
      // the search must've brought no results :/
      return client.sendMessage(roomId, {
        body: `Sorry, but the query returned no results :(\nYou'll probably have to log on Matrix for this one.`,
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: `Sorry, but the query returned no results :(\nYou'll probably have to log on Matrix for this one.`,
      });
    }

    let display_name = // get the display name of the sender of the first result of that search
      search["search_categories"]["room_events"]["results"][0]["context"][
        "profile_info"
      ][sender_mxid]["displayname"];

    console.log(sender_mxid + ": " + display_name);

    if (msg.author.username == display_name) {
      // make sure display names match!
      return client.sendMessage(roomId, {
        body: sender_mxid.slice(1),
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: htmlEscape(sender_mxid.slice(1)),
      });
    } else {
      return client.sendMessage(roomId, {
        body: `Sorry, but the query returned no results :(\nYou'll probably have to log on Matrix for this one.`,
        msgtype: "m.notice",
        format: "org.matrix.custom.html",
        formatted_body: `Sorry, but the query returned no results :(\nYou'll probably have to log on Matrix for this one.`,
      });
    }
  } catch {
    return client.sendMessage(roomId, {
      body: "Something went wrong running this command",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: "Something went wrong running this command",
    });
  }
}
