import {Command} from "../../structures/Command";
import {ApplicationCommandType, PermissionsBitField} from "discord.js";
import {CommandMode} from "../../structures/enums";

export default new Command({
    name : "sudo",
    description : "Commander !",
    mode : CommandMode.Slash,
    permissions : [PermissionsBitField.Flags.Administrator],
    type : ApplicationCommandType.Message,
    requiredRoles : ["1012005494954659911"],
    async execute({message, interaction }){
        //return message?.reply({content : "Hey there !! SUdo sudo"})
        message?.reply({content : "Hiii"})
    }
})