import {
    ApplicationCommandData, ApplicationCommandType,
    Client,
    Collection, Message, PermissionsBitField
} from "discord.js";
import * as fs from "fs";
import * as path from "path";
import type { CommandOptions } from "../typings/Command";
import type { SdhandlerOptions } from "../typings/Sdhandler";
import { CommandMode } from "./enums";

const weirdArt : string= `${"|\n".repeat(10)}\t${""}`

export class SDClient extends Client{
    commands : Collection<string, CommandOptions> = new Collection<string, CommandOptions>();
    customData : SdhandlerOptions
    constructor(customData : SdhandlerOptions) {
        super({
            intents : customData.intents,
        });
        this.customData = customData;
        this.init();
        this.start(this.customData.token).then(null);
    }
    private init(){
        if(!this.customData.commandsDir) this.customData.commandsDir = "commands";
        if(!this.customData.eventsDir) this.customData.eventsDir = "events";
        if(!this.customData.buttonsDir) this.customData.buttonsDir = "buttons";

        if(this.customData.compileFolder){
            this.customData.commandsPath = path.join(process.cwd() ,`${this.customData.compileFolder}`,`${this.customData.commandsDir}`) ?? path.join(process.cwd() , `${this.customData.compileFolder}`,"commands");
            this.customData.eventsPath = path.join(process.cwd() , `${this.customData.compileFolder}`,`${this.customData.eventsDir}`) ?? path.join(process.cwd(),`${this.customData.compileFolder}`, 'events');
            this.customData.buttonsPath = path.join(process.cwd() ,`${this.customData.compileFolder}`, `${this.customData.buttonsDir}`) ?? path.join(process.cwd() ,`${this.customData.compileFolder}`, 'buttons');
        }
        else {
            this.customData.commandsPath = path.join(process.cwd(), `${this.customData.commandsDir}`) ?? path.join(process.cwd(), "commands");
            this.customData.eventsPath = path.join(process.cwd(), `${this.customData.eventsDir}`) ?? path.join(process.cwd(), 'events');
            this.customData.buttonsPath = path.join(process.cwd(), `${this.customData.buttonsDir}`) ?? path.join(process.cwd(), 'buttons');
        }
    }
    private async start(token : string){
        await this.login(token).then(null);
        this.registerCommands().then(null);
        this.startHandler();
    }

    private async importFile(path : string){
        return (await import(path))?.default
    }

    private async startHandler(){
        this.on("messageCreate" , async(message: Message) => {

            if(message.author.bot) return;
            // Check for prefix !
            const prefix = this.customData.prefix?.filter(p => message.content.startsWith(p));
            if(!prefix?.length) return;

            const args : string[] = message.content.slice(prefix[0].length).split(/ +/);
            const cmd = args?.shift()?.toLowerCase();

            const command = this.commands.get((cmd as string));
            if(!command) return;

            // Check for permissions and execute the command !

            try{
                const perms = new PermissionsBitField(command.permissions ?? PermissionsBitField.Flags.SendMessages);

                if (!message.member?.permissions.has(perms)) {
                    return console.log('person doesnt have perm!')
                    // it means they don't have permission
                }

            }
            catch(e){
                 message.reply({content : "There was some error while trying to run this command !"}).then(null);
            }

            await command.execute({ client: this, channel: message.channel, member: message.member!, message })

        } )
    }

    private async registerSlash(commands : ApplicationCommandData[]){
        if(this.customData.testOnly){
            console.log(`[+] Loaded ${commands.length} Guild Slash Command(s) in : \n`)
            // Register Guild Slash Commands !
            if(this.customData.guildId && Array.isArray(this.customData.guildId)){
                // Loop through all the guild Ids !
                for(let guildId of this.customData.guildId){
                    const guild = this.guilds.cache.get(guildId);
                    if(guild){
                        await guild.commands.set(commands);
                        console.log(`${guild.name}`);
                    }
                    else{
                        console.log(`[!] Could not find any guild with ${guildId} ID.`)
                    }
                }
            }
            else throw new Error("Please provide your test guild ids or disable testOnly.")
        }
        else{
            // Register Global Slash Commands !
            await this.application?.commands.set(commands);
            console.log(`\nRegistered ${commands.length} Global Slash Command(s) !`)

        }
    }

    private async registerCommands(){
        // Some checks.
        if(!fs.lstatSync(`${this.customData.commandsPath}`)) throw new Error(`[-] ${this.customData.commandsPath} is not a valid path !`)
        if(!(fs.lstatSync(`${this.customData.commandsPath}`).isDirectory())) throw new Error(`[-] ${this.customData.commandsPath} is not a Directory !`)

        const contents = fs.readdirSync(`${this.customData.commandsPath}`);
        const categories  = contents.filter(c => fs.lstatSync(`${this.customData.commandsPath}/${c}`).isDirectory()) as string[];
        if(categories.length > 0){
            console.log("Commands \n")
            // For commands enclosed in various categories!

            for(let category of categories){
                console.log(`${category}`)
                const files = fs.readdirSync(`${path.join(this.customData.commandsPath! , category)}`).filter(file => file.endsWith(".js"))
                for(let file of files){
                    const command : CommandOptions = await this.importFile(`${path.join(`${this.customData.commandsPath}` , category , file)}`)

                    if(!command.name) continue;
                    console.log(`${command.name} : ✅`)
                    this.commands.set(command.name , command);
                }
            }
            console.log(`Added ${this.commands.size} command(s) in total !\n`)
        }

        else{
            // For standalone command files.
            const files = fs.readdirSync(this.customData.commandsPath!).filter(file => file.endsWith(".js"))
            if(files.length > 0){
                console.log("Commands \n")
                for(let file of files){
                    const command : CommandOptions = await this.importFile(`${path.join(`${this.customData.commandsPath}`, file)}`)

                    if(!command.name) continue;
                    console.log(`${command.name} : ✅`);
                    this.commands.set(command.name , command);
                }

                console.log(`Added ${this.commands.size} command(s) in total !\n`)
            }

        }

        if(this.commands.size > 0){
            const slashCommands : ApplicationCommandData[] = [];

            // Filter the data !
            this.commands.forEach(command => {

                if(command.mode === CommandMode.BOTH || command.mode === CommandMode.Slash){

                    if(command.type === ApplicationCommandType.User || command.type === ApplicationCommandType.Message){

                        delete command.description;
                        slashCommands.push({
                            name : command.name,
                            type : command.type,
                            options : command.options,
                        })
                    }
                    else{

                        if(!command.description) command.description = "Nothing Provided !"
                        slashCommands.push({
                            name : command.name,
                            description : command.description,
                            type : command.type,
                            options : command.options
                        })
                    }

                                  }
            })

            // Call the registerSlash Function here !
            this.registerSlash(slashCommands).then(null);
        }
    }
}