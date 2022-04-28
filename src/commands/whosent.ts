// -=- SYNTAX : ;whosent <https://discord.com/channels/[guild]/[channel]/[message]>
import { MatrixClient } from "matrix-bot-sdk";
import * as htmlEscape from "escape-html";
import { guild } from "./discord_handler";
import { COMMAND_PREFIX } from "./handler";

export async function runWhoSentCommand(
  roomId: string,
  args: string[],
  client: MatrixClient,
) {
  if (!args[1]) {
    return client.sendMessage(roomId, {
      body:
        "Usage: " +
        COMMAND_PREFIX +
        "whosent <Discord URL to message>",
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body:
      "Usage: " +
      COMMAND_PREFIX +
      "whosent <Discord URL to message>",
    });
  }
  let command = args[1].split("/");
  let input = {
    guild: command[4],
    channel: command[5],
    message: command[6],
  };
  let channel = guild.channels.cache.get(input.channel);
  let msg = await channel.messages.fetch(input.message);

  console.log(msg.author.username + ": " + msg.content);

  client.sendMessage(roomId, {
    body: `Searching . . .`,
    msgtype: "m.notice",
    format: "org.matrix.custom.html",
    formatted_body: `Searching . . .`,
  });

  let search = await client.doRequest(
    "POST",
    "/_matrix/client/r0/search",
    undefined,
    {
      search_categories: {
        room_events: {
          search_term: msg.content,
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
    sender_mxid =
      search["search_categories"]["room_events"]["results"][0]["result"][
        "sender"
      ];
  } catch {
    return client.sendMessage(roomId, {
      body: `Sorry, but the query returned no results :(\nYou'll probably have to log on Matrix for this one.`,
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: `Sorry, but the query returned no results :(\nYou'll probably have to log on Matrix for this one.`,
    });
  }

  let display_name =
    search["search_categories"]["room_events"]["results"][0]["context"][
      "profile_info"
    ][sender_mxid]["displayname"];

  console.log(sender_mxid + ": " + display_name);

  if (msg.author.username == display_name) {
    return client.sendMessage(roomId, {
      body: sender_mxid.slice(1),
      msgtype: "m.notice",
      format: "org.matrix.custom.html",
      formatted_body: htmlEscape(sender_mxid.slice(1)),
    });
  }
}
