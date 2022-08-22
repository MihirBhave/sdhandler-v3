import {SDClient} from "./structures/Client";
import {GatewayIntentBits} from "discord.js";


new SDClient({
    token : "Ma token",
    intents : [GatewayIntentBits.Guilds], // The Intents
    compileFolder : "dist", // Compile folder name ,only for TS
    testOnly : true,
    guildId : ["id1"]
})

export {SDClient};
