# graim
matrix &lt;=> discord moderation with the power of t2bot's matrix-appservice

## THIS IS NOT EVEN CLOSE TO FINISHED LOL
Don't use it

## TODOs
Note there is more to-do, this is just the current high priority / next on the list.

 - Mute
 - Database management commands (add/remove user, add/remove moderator)
 - `whosent` command

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

Every Discord user, via matrix-appservice-t2bot, is given its own user (i.e. `@_discord_<discord_id>:t2bot.io`. So, graim listens for commands only from Matrix users - because Discord users are Matrix users by proxy.
Simply tie a server to a group of rooms, then tie each Matrix user to a Discord account packaged in one "graim user" :D
