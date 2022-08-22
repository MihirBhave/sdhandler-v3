import {Command} from "../../structures/Command";
import {ApplicationCommandType, PermissionsBitField} from "discord.js";
import {CommandMode} from "../../structures/enums";

export default new Command({
    name : "sudo",
    description : "Commander !",
    mode : CommandMode.BOTH,
    permissions : [PermissionsBitField.Flags.SendMessages],
    async execute({message, interaction}){
        console.log("Works !!")
    }
})