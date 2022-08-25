"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../structures/Command");
const discord_js_1 = require("discord.js");
const enums_1 = require("../../structures/enums");
require("../../events/message");
exports.default = new Command_1.Command({
    name: "sudo",
    description: "Commander !",
    mode: enums_1.CommandMode.Slash,
    permissions: [discord_js_1.PermissionsBitField.Flags.Administrator],
    type: discord_js_1.ApplicationCommandType.Message,
    requiredRoles: ["1012005494954659911"],
    async init({ client }) {
        client.on('messageCreate', async (message) => {
            console.log(message.content);
        });
    },
    async execute({ message, interaction, client, member }) {
        const row = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId('something')
            .setLabel('Primary')
            .setStyle(discord_js_1.ButtonStyle.Primary));
        const data = await client.basicMemberInfo(member);
        console.log(data);
        await interaction.reply({ content: 'Pong!', components: [row] });
    }
});
