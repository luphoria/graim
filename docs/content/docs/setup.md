---
Title: "Setup"
Description: "Setup"
draft: false
---
If you want to run graim for your own community, this guide should be the one-stop spot to getting everything set up!

## Prerequisites
- some server (a PC that stays online will do fine) - must have `node`, `git`, `npm`
- a Discord account
- a Discord server
- one Matrix room for every Discord channel you would like to bridge

## Getting started
First, you will need to create a Discord bot and a Matrix account (which the bot will use). 

### Add the bridge to your communities
Follow the tutorial [here](https://t2bot.io/discord/). You may also run your own bridge, and it is supported; however, that is advanced and out of the scope of this tutorial

## Download graim
Open your terminal or command prompt and type these commands:
```sh
git clone https://github.com/luphoria/graim
cd graim
npm install
```
Graim is now installed to your device - but now it needs some configuration.

### Create the Discord bot
- Navigate to [Discord's application panel](https://discord.com/developers/applications).
- Create a new application.
- Go to the Bot section, make note of the token and client ID - you'll need them later.
- Make sure you have checked "Server Members Intent"!

### Create the Matrix bot user
- Create a Matrix account like any other. Give it whatever name you'd like.
- Enter the user settings and find the "Access Token".
- Copy the access token. **Do not share your access token.** Treat it like your password.

## Configure graim
To begin, you are going to need to run some commands.
```
cp graimdb.json.example graimdb.json
cd config/default.yaml.example default.yaml
```
Now, open config/default.yaml in your preferred text editor.
- set `accessToken` to whatever your Matrix user's access token is.
- set `autoJoin` to `true` (you will want to disable this after setup but it isn't a big deal).
- Set `discordToken` to your Discord bot's access token.
- Set `discordClient` to your Discord application's "client ID" or "application ID".
- Set `discordGuild` to the Discord guild (server) you want it to be active in.
- Set `discordMutedRole` to a role in aforementioned guild, which presumably prevents the user from speaking.
- Configure anything else you want given your situation.

Graim is now ready for you to run it! Go back to your terminal, and run `npm run start:dev`.

Wait a few seconds, and you should see the bot is working!

## Invite graim
Now, you have to actually add graim to the communities it is moderating.

### Adding the Discord bot
- Copy your Discord bot's "application ID" or "client ID" (same variable as `discordClient`).
- Paste that ID in the following link: `https://discordapp.com/api/oauth2/authorize?client_id=`&lt;YOUR CLIENT ID HERE&gt;`&scope=bot&permissions=8`
- Complete the steps as Discord autofills them.
- Once graim is in your server, ensure that the `graim` role in your roles list is placed higher than the `muted` role - otherwise, graim will crash if you try to mute.

### Adding the Matrix bot
- Invite the bot to every room needed, as you would any other user
- For each room, make the bot a `Moderator` (power level 50), and adjust `Change permissions` in the room to `Moderator` - this will allow it to change other users' power levels to -1, effectively muting them. Additionally, it is highly recommended you change `Notify everyone` to `Admin` - otherwise a user could potentially elevate their permissions via the bot to ping @room.

### Adding yourself to the moderator list
In order to use any graim commands, you first need to be considered a moderator by graim itself.

- Run `;adduser <alias> @user:matrixexample.org @discorduser moderator` from an Admin (power level 100) account on Matrix.

NOTE: Any new moderators you add will also be able to run `adduser` - whether they have power level 100 or not.

### graim-side room bridging
In order for the `lock` command to function, you must run `bridgeroom <discord channel id>` in all rooms/channels.

### Logging room
You will probably want a logging room. This can be a public or private room, but either way it must be bridged to Discord. To set a room as the designated logging room, run the command `setloggingroom` to implement it.

### Lint
Lastly, just make sure you've set everything up right! Run the command `lint` in any channel, and it will tell you any misconfigurations.

**Congratulations, you have set up graim!**
