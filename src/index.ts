import {
  AutojoinRoomsMixin,
  LogLevel,
  LogService,
  MatrixClient,
  RichConsoleLogger,
} from "matrix-bot-sdk";
import config from "./config";
import CommandHandler from "./commands/handler";

// First things first: let's make the logs a bit prettier.
LogService.setLogger(new RichConsoleLogger());

// For now let's also make sure to log everything (for debugging)
LogService.setLevel(LogLevel[config.loglevel] || "DEBUG");

// Also let's mute Metrics, so we don't get *too* much noise
LogService.muteModule("Metrics");

// Print something so we know the bot is working
LogService.info("index", "Bot starting...");

export const startedWhen = Date.now();

// This is the startup closure where we give ourselves an async context
(async function () {
  // Now create the client
  const client = new MatrixClient(config.homeserverUrl, config.accessToken);

  // Setup the autojoin mixin (if enabled)
  if (config.autoJoin) {
    AutojoinRoomsMixin.setupOnClient(client);
  }

  // Prepare the command handler
  const commands = new CommandHandler(client);
  await commands.start();

  LogService.info("index", "Starting sync...");
  await client.start(); // This blocks until the bot is killed
})();
