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
LogService.setLevel(LogLevel[config.loglevel] || LogLevel.DEBUG);

// Also let's mute Metrics, so we don't get *too* much noise
LogService.muteModule("Metrics");

// Print something so we know the bot is working
LogService.info("index", "Bot starting...");

// Prevent graim from responding to old messages w/sync
export const startedWhen = Date.now();

// This is the startup closure where we give ourselves an async context
(async function () {
  // Now create the client
  const client = new MatrixClient(config.homeserverUrl, config.accessToken);

  // Set up autojoin
  if (config.autoJoin) {
    // Not using the in-SDK solution, so that I can also join all rooms in a space.
    client.on("room.invite", async (roomId) => {
      // Join room
      await client.joinRoom(roomId).then(async () => {
        // Grab room state event and filter just the space children
        (await client.getRoomState(roomId))
          .filter((ev) => ev["type"] == "m.space.child")
          .forEach((spaceChild) => {
            // Join each child
            return client.joinRoom(
              spaceChild["state_key"],
              spaceChild["content"]["via"]
            );
          });
      });
    });
  }

  // Prepare the command handler
  const commands = new CommandHandler(client);
  await commands.start();

  LogService.info("index", "Starting sync...");
  await client.start(); // This blocks until the bot is killed
})();
