"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../structures/Command");
require("discord.js");
const enums_1 = require("../../structures/enums");
exports.default = new Command_1.Command({
    name: "sudo",
    description: "Commander !",
    mode: enums_1.CommandMode.BOTH,
    async execute({ message, interaction }) {
        console.log("Works !!");
    }
});
