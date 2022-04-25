import * as config from "config";

interface IConfig {
    prefix: string;
    homeserverUrl: string;
    appserviceHS: string;
    accessToken: string;
    autoJoin: boolean;
    dataPath: string;
    encryption: boolean;
    discordToken: string;
    discordClient: string;
    discordGuild: string;
    discordMutedRole: string;
}

export default <IConfig>config;
