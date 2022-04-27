# graim
matrix &lt;=&gt; discord moderation with the power of matrix-appservice-discord

## Social
graim's website is viewable at https://gra.im.
You can join the graim [Matrix space](https://matrix.to/#/#graim:matrix.org) as well as the [Discord server](https://discord.gg/MV7fDb4AKy). *the main matrix room is @ [#graim-general:matrix.org](https://matrix.to/#/#graim-general:matrix.org)

## Configure/Install
Check out the [configuration guide](./setup.md).

## TODOs
Note there is more to-do, this is just the current high priority / next on the list.

 - Database management commands (add/remove user, add/remove moderator)
 - `whosent` command
 - sync moderation across rooms
 - LOTS OF BUG FIXING!

## Features
- Kick
- Ban + unban
- Mute
- Discord moderators may use `whosent` to discover what matrix user is behind a Discord message
- Userinfo command

## How
graim is built with the intention of being Matrix-first. There are a few reasons for this:
- Discord API sucks
- Discord webhooks have incredibly little data attributed to them
- I <3 Matrix

Every Discord user, via matrix-appservice-discord, is given its own user (i.e. `@_discord_<discord_id>:matrix.org`. So, graim listens for commands only from Matrix users - because Discord users are Matrix users by proxy.
Simply tie a server to a group of rooms, then tie each Matrix user to a Discord account packaged in one "graim user" :D
