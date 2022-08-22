import {Command} from "../../structures/Command";
import  {ApplicationCommandType} from "discord.js";
import {CommandMode} from "../../structures/enums";

export default new Command({
    name : "sudo",
    description : "Commander !",
    mode : CommandMode.BOTH,
    async execute({message, interaction}){
        console.log("Works !!")
    }
})