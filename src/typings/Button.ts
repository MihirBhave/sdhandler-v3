import type{SDClient} from "../structures/Client";
import type{ButtonInteraction} from "discord.js";

interface ButtonRunOptions{
    client : SDClient,
    interaction : ButtonInteraction,
}

type ButtonRunFunction = (options : ButtonRunOptions) => any;

export type ButtonOptions = {
    name : string,
    run : ButtonRunFunction
}