import {Command} from "../../structures/Command";
import {
    ApplicationCommandType,
    ButtonBuilder,
    PermissionsBitField,
    ButtonStyle,
    ActionRowBuilder,
    MessageActionRowComponent, MessageActionRowComponentBuilder, GuildMember
} from "discord.js";
import {CommandMode} from "../../structures/enums";
import message from "../../events/message";

export default new Command({
    name : "sudo",
    description : "Commander !",
    mode : CommandMode.Slash,
    permissions : [PermissionsBitField.Flags.Administrator],
    type : ApplicationCommandType.Message,
    requiredRoles : ["1012005494954659911"],
    async init({client}){
        client.on('messageCreate' , async(message) => {
            console.log(message.content)
        })
    },
    async execute({message, interaction  , client , member}){

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('something')
                    .setLabel('Primary')
                    .setStyle(ButtonStyle.Primary),
            );
        const data = await client.basicMemberInfo(member);
        console.log(data)
        await interaction!.reply({ content: 'Pong!', components: [(row as ActionRowBuilder<MessageActionRowComponentBuilder>)] });

    }
})