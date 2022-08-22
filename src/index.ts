import {SDClient} from "./structures/Client";
import {GatewayIntentBits} from "discord.js";


new SDClient({
    token : "OTM3MzkxMzA5OTMxNTY5MTUy.G6Npb8.YZJi9y4LcuSMxwRnM8PU_IiHpNGTKFLZAlKER8",
    intents : [GatewayIntentBits.Guilds],
    compileFolder : "dist",
    testOnly : true,
    guildId : ["id1"]
})

export {SDClient};
