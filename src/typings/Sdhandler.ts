import type {
    ApplicationCommandData,
    GatewayIntentBits,
    GatewayIntentsString
} from "discord.js";

export type SdhandlerOptions = {
    token : string,
    intents : GatewayIntentBits[] | GatewayIntentsString[],
    testOnly? : boolean,
    commandsDir? : string,
    eventsDir? : string,
    buttonsDir? : string,
    guildId? : string[],
    prefix? : string[],
    commandsPath? : string,
    eventsPath? : string,
    buttonsPath? : string,
    compileFolder? : string
}
