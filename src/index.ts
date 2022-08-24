import { GatewayIntentBits } from "discord.js";
import { SDClient } from "./structures/Client";


new SDClient({
    token : "TOKEN",
    intents : [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages], // The Intents
    compileFolder : "dist", // Compile folder name ,only for TS
    testOnly : false,
    prefix: ['!'],
})

export { SDClient };

