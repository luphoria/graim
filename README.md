# graim
matrix &lt;=&gt; discord moderation with the power of matrix-appservice-discord

## Social
graim's website is viewable at https://gra.im.
You can join the graim [Matrix space](https://matrix.to/#/#graim:matrix.org) as well as the [Discord server](https://discord.gg/MV7fDb4AKy). *the main matrix room is @ [#graim-general:matrix.org](https://matrix.to/#/#graim-general:matrix.org)

## ⚠️ WARNING ⚠️
graim is VERY early in beta at the moment. it is unstable and not feature-complete.

DO NOT use graim unless you intend to help with development. If you need a solution like graim, I advise you join our Discord or Matrix for updates to when graim IS ready for real-world usage!

## Configure/Install
Check out the [configuration guide](./setup.md).

## TODOs
Note there is more to-do, this is just the current high priority / next on the list.

 - `whosent` command
 - LOTS OF BUG FIXING!

## Features
- Kick
- Ban + unban
- Mute
- Discord moderators may use `whosent` to discover what matrix user is behind a Discord message
- Userinfo command
- moderation syncs across rooms
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
