"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../structures/Command");
const discord_js_1 = require("discord.js");
const enums_1 = require("../../structures/enums");
exports.default = new Command_1.Command({
    name: "sudo",
    description: "Commander !",
    mode: enums_1.CommandMode.Slash,
    permissions: [discord_js_1.PermissionsBitField.Flags.Administrator],
    type: discord_js_1.ApplicationCommandType.Message,
    requiredRoles: ["1012005494954659911"],
    async execute({ message, interaction }) {
        //return message?.reply({content : "Hey there !! SUdo sudo"})
        message?.reply({ content: "Hiii" });
    }
});
