---
Title: "graim"
Description: "Index"
draft: false
---
matrix &lt;=&gt; discord moderation with the power of matrix-appservice-discord

## Social
graim's website is viewable at [gra.im](https://gra.im).
You can join the graim [Matrix space](https://matrix.to/#/#graim:gra.im) as well as the [Discord server](https://discord.gg/MV7fDb4AKy). *the main matrix room is @ [#general:gra.im](https://matrix.to/#/#general:gra.im)

## Configure/Install
Check out the [configuration guide](/docs/setup).

## TODOs
- Bug fixing
- Better guides

## Features
- moderation syncs across rooms
- Kick, ban + unban
- Mute
- Strike system
- Automatically attribute moderation history to graimdb
- Discord moderators may use `whosent` to discover what matrix user is behind a Discord message
- Userinfo command
- Database management commands (add/remove user, add/remove moderator)


## How
graim is built with the intention of being Matrix-first. There are a few reasons for this:
- Discord API sucks
- Discord webhooks have incredibly little data attributed to them
- I <3 Matrix

Every Discord user, via matrix-appservice-discord, is given its own user (i.e. `@_discord_<discord_id>:matrix.org`. So, graim listens for commands only from Matrix users - because Discord users are Matrix users by proxy.
Simply tie a server to a group of rooms, then tie each Matrix user to a Discord account packaged in one "graim user" :D

## Credits
The bot itself - [luphoria](https://luphoria.com)

Any other [contributors](https://github.com/luphoria/graim/contributors)

Built with **major help** from [turt2live/matrix-bot-sdk-bot-template](https://github.com/turt2live/matrix-bot-sdk-bot-template) by Travis Ralston

Uses the dependencies:
 - [matrix-bot-sdk](https://github.com/turt2live/matrix-bot-sdk)
 - [discord.js](https://discord.js.org/)
 - [escape-html](https://github.com/component/escape-html)
 - [config](https://github.com/lorenwest/node-config)
 - [js-yaml](https://github.com/nodeca/js-yaml)

Special thanks:
 - **HalfShot** for **[matrix-appservice-discord](https://github.com/Half-Shot/matrix-appservice-discord)** for the Discord <-> Matrix bridge itself
 - **[Travis Ralston](https://github.com/turt2live)** for the tons of free resources which I used a LOT of
