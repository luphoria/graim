# Setup
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

### Create the Discord bot
- Navigate to [Discord's application panel](https://discord.com/developers/applications).
- Click "New Application" - in the top right corner:

![image](https://user-images.githubusercontent.com/60309933/165204401-a98a6434-f9b3-455d-9783-f7cf0d855724.png)
- Give it any name and "Create".

![image](https://user-images.githubusercontent.com/60309933/165204488-467714cd-7dc2-4396-a751-5441069264a5.png)
- Copy the "Application ID".

![image](https://user-images.githubusercontent.com/60309933/165204798-ad507d60-c628-4388-8a3c-b107fba36b9c.png)
- Click the "Bot" tab on the left-hand side of the screen.
- Click "Add Bot" and confirm the decision.
- Hit "Reset Token" to view the bot's token. Copy this token. **Do not share your bot token.** Treat it like your password.
- Un-check "public bot".

![image](https://user-images.githubusercontent.com/60309933/165204734-966e8fb2-db6e-486a-b01d-aedbbd74ef65.png)
- Make sure you have checked "Server Members Intent"!

### Create the Matrix bot user
This tutorial is created with [Element](https://app.element.io) in mind.
- Create a Matrix account like any other. Give it whatever name you'd like.
- Press the top-left user profile icon, and then press "All settings".
- Press "Help & About".
- Scroll to the bottom, and click on "Access Token".
- Copy the access token. **Do not share your access token.** Treat it like your password.

## Download graim
Open your terminal or command prompt and type these commands:
```
git clone https://github.com/luphoria/graim
cd graim
npm install
```
Graim is now installed to your device - but now it needs some configuration.

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

**Note: the following is planned to be set up within the bot's interface at a later date**

Now, open graimdb.json in your preferred text editor.
- Set `"name"` to `"`whatever you want your graim alias to be (i.e.: `luphoria`)`"`.
- Set `"matrix"` to your personal Matrix account (NOT including the preceding `@` - i.e. `"luphoria:matrix.org"`).
- Set `"discord"` to your personal Discord account's ID (i.e. `"966488436041203712"`).

Graim is now ready for you to run it! Go back to your terminal, and run `npm run start:dev`.

Wait a few seconds, and you should see the bot is working!

## Invite graim
Now, you have to actually add graim to the communities it is moderating.

### Adding the Discord bot
  - Copy your Discord bot's "application ID" or "client ID" (same variable as `discordClient`).
  - Paste that ID in the following link: `https://discordapp.com/api/oauth2/authorize?client_id=`&lt;YOUR CLIENT ID HERE&gt;`&scope=bot&permissions=8`
  - Complete the steps as Discord autofills them.

### Adding the Matrix bot
Simply invite the bot to each room, as you would any other user, and it should instantly join the room. Make sure the bot is running!  

**Congratulations, you have set up graim!**
