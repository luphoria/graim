import Discord = require("discord.js");
export const discord_client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS],
});
import config from "../config";

discord_client.on("ready", () => {
  console.info(
    "Discord bot started! Logged in: " + discord_client.user.tag
  );
});

discord_client.login(config.discordToken);
