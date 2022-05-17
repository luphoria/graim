import * as config from "config";

interface IConfig {
  prefix: string;
  verbose: boolean;
  loglevel: string;
  homeserverUrl: string;
  appserviceHS: string;
  accessToken: string;
  autoJoin: boolean;
  discordToken: string;
  discordClient: string;
  discordGuild: string;
  discordMutedRole: string;
}

export default <IConfig>config;
