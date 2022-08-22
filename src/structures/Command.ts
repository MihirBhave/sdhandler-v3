import type {CommandOptions} from "../typings/Command";

export class Command {
        constructor(options : CommandOptions) {
            Object.assign(this , options);
        }
}