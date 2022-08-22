import type {
    BaseInteraction,
    CommandInteractionOption,
    CommandInteractionOptionResolver,
    GuildMember,
    Message,
    PermissionResolvable,
    TextBasedChannel,
    ApplicationCommandType, ApplicationCommandData, ApplicationCommandOptionData, PermissionFlags
} from "discord.js";

import type {SDClient} from "../structures/Client";
import type{CommandMode} from "../structures/enums";
import {PermissionsBitField} from "discord.js";

interface InitOptions {
    client : SDClient,
}
type InitFunction = (options : InitOptions) => unknown;
interface ExecuteOptions{
    client : SDClient,
    message? : Message,
    interaction? : BaseInteraction,
    options? : CommandInteractionOptionResolver,
    args? : string[],
    member : GuildMember,
    channel : TextBasedChannel,
}
type ExecuteFunction = (options : ExecuteOptions) => unknown;

// Command Data Options

export type  CommandOptions = {
    name : string,
    description? : string,
    permissions? : PermissionResolvable,
    mode : CommandMode,
    type? : ApplicationCommandType,
    requiredRoles? : string[],
    aliases? : string[],
    options? : ApplicationCommandOptionData[],
    init? : InitFunction,
    execute : ExecuteFunction
}

