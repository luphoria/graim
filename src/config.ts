import * as config from "config";

interface IConfig {
    homeserverUrl: string;
    appserviceHS: string;
    accessToken: string;
    autoJoin: boolean;
    dataPath: string;
    encryption: boolean;
    discordToken: string;
    discordClient: string;
    discordGuild: string;
}

export default <IConfig>config;
