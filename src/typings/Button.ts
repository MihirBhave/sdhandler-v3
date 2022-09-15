import type { SDClient } from "../structures/Client";
import type { Awaitable, ButtonInteraction } from "discord.js";

interface ButtonRunOptions {
  client: SDClient;
  interaction: ButtonInteraction;
}

type ButtonRunFunction = (options: ButtonRunOptions) => Awaitable<void>;

export type ButtonOptions = {
  name: string;
  run: ButtonRunFunction;
};
