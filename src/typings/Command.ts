import type {
  CommandInteractionOptionResolver,
  GuildMember,
  Message,
  PermissionResolvable,
  TextBasedChannel,
  ApplicationCommandType,
  ApplicationCommandOptionData,
  ChatInputCommandInteraction,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  Awaitable,
} from "discord.js";

import type { SDClient } from "../structures/Client";
import type { CommandMode } from "../structures/enums";

interface InitOptions {
  client: SDClient;
}
type InitFunction = (options: InitOptions) => Awaitable<void>;
interface ExecuteOptions {
  client: SDClient;
  message?: Message;
  interaction?:
    | ChatInputCommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction;
  options?: CommandInteractionOptionResolver;
  args?: string[];
  member: GuildMember;
  channel: TextBasedChannel;
}
type ExecuteFunction = (options: ExecuteOptions) => unknown | Promise<unknown>;

// Command Data Options

export type CommandOptions = {
  name: string;
  description?: string;
  permissions?: PermissionResolvable;
  mode: CommandMode;
  type?: ApplicationCommandType;
  requiredRoles?: string[];
  aliases?: string[];
  options?: ApplicationCommandOptionData[];
  init?: InitFunction;
  execute: ExecuteFunction;
};
