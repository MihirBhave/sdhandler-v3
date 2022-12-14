import {
  ApplicationCommandData,
  ApplicationCommandType,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  Collection,
  CommandInteractionOptionResolver,
  GuildMember,
  Message,
  MessageContextMenuCommandInteraction,
  PermissionsBitField,
  UserContextMenuCommandInteraction,
} from "discord.js";
import * as fs from "fs";
import * as path from "path";
import type { CommandOptions } from "../typings/Command";
import type { Event } from "./Event";
import type { SdhandlerOptions } from "../typings/Sdhandler";
import { CommandMode } from "./enums";
import type { ButtonOptions } from "../typings/Button";

export class SDClient extends Client {
  private commands = new Collection<
    string,
    CommandOptions
  >();
  customData: SdhandlerOptions;
  buttonData = new Collection<
    string,
    ButtonOptions
  >();

  constructor(customData: SdhandlerOptions) {
    super({
      intents: customData.intents,
    });
    this.customData = customData;
    this.init();
    this.start(this.customData.token).then(null);
  }
  private init() {
    if (!this.customData.commandsDir) this.customData.commandsDir = "commands";
    if (!this.customData.eventsDir) this.customData.eventsDir = "events";
    if (!this.customData.buttonsDir) this.customData.buttonsDir = "buttons";
    if (!this.customData.prefix) this.customData.prefix = ["!"];

    if (this.customData.compileFolder) {
      this.customData.commandsPath =
        path.join(
          process.cwd(),
          `${this.customData.compileFolder}`,
          `${this.customData.commandsDir}`
        ) ??
        path.join(
          process.cwd(),
          `${this.customData.compileFolder}`,
          "commands"
        );
      this.customData.eventsPath =
        path.join(
          process.cwd(),
          `${this.customData.compileFolder}`,
          `${this.customData.eventsDir}`
        ) ??
        path.join(process.cwd(), `${this.customData.compileFolder}`, "events");
      this.customData.buttonsPath =
        path.join(
          process.cwd(),
          `${this.customData.compileFolder}`,
          `${this.customData.buttonsDir}`
        ) ??
        path.join(process.cwd(), `${this.customData.compileFolder}`, "buttons");
    } else {
      this.customData.commandsPath =
        path.join(process.cwd(), `${this.customData.commandsDir}`) ??
        path.join(process.cwd(), "commands");
      this.customData.eventsPath =
        path.join(process.cwd(), `${this.customData.eventsDir}`) ??
        path.join(process.cwd(), "events");
      this.customData.buttonsPath =
        path.join(process.cwd(), `${this.customData.buttonsDir}`) ??
        path.join(process.cwd(), "buttons");
    }
  }
  private async start(token: string) {
    await this.login(token).then(() =>
      console.log(
        `Logged in as ${this.user!.tag}`
      )
    );
    await this.startEvents();
    this.registerCommands().then(null);
    await this.registerButtons().then(null);
    await this.startHandler();
  }

  private async importFile(path: string) {
    return (await import(path))?.default;
  }

  private async startHandler() {
    // Listen for Commands now !

    this.on("messageCreate", async (message: Message) => {
      if (message.author.bot) return;
      // Check for prefix !
      const prefix = this.customData.prefix?.filter((p) =>
        message.content.startsWith(p)
      );
      if (!prefix?.length) return;

      const args: string[] = message.content
        .slice(prefix[0].length)
        .split(/ +/);
      const cmd = args?.shift()?.toLowerCase();

      const command =
        this.commands.get(cmd as string) ||
        this.commands.find((c) => Boolean(c.aliases?.includes(cmd!)));
      if (!command) return;

      if (command.mode === CommandMode.Slash) return;
      // Check for permissions and execute the command !

      try {
        const perms = new PermissionsBitField(
          command.permissions ?? PermissionsBitField.Flags.SendMessages
        );

        if (message.member?.permissions.has(perms)) {
          await command.execute({
            message: message,
            client: this,
            member: message.member,
            channel: message.channel,
            args: args,
          });
        } else {
          const roleIds = command.requiredRoles!;
          if (roleIds) {
            const hasRole = roleIds.filter((roleId) =>
              message.member?.roles.cache.has(roleId)
            );

            if (hasRole.length > 0) {
              await command.execute({
                message: message,
                client: this,
                member: message.member!,
                channel: message.channel,
                args: args,
              });
            } else {
              await message
                .reply({
                  content: "You do not have permission to run this command !",
                })
                .then((msg) => setTimeout(() => msg.delete(), 5000))
                .catch(null);
            }
          } else {
            await message
              .reply({
                content: "You do not have permission to run this command !",
              })
              .then((msg) => setTimeout(() => msg.delete(), 5000))
              .catch(null);
          }
        }
      } catch (e) {
        console.log(e);
        message
          .reply({
            content: "There was some error while trying to run this command !",
          })
          .then(null);
      }
    });

    this.on("interactionCreate", async (interaction) => {
      if (interaction.isCommand()) {
        const command = this.commands.get(interaction.commandName);
        if (!command) return;

        if (!command.type) command.type = ApplicationCommandType.ChatInput;
        const member = interaction.member as GuildMember;
        const permissions = new PermissionsBitField(
          command.permissions ?? [PermissionsBitField.Flags.SendMessages]
        );
        switch (command.type) {
          case ApplicationCommandType.ChatInput:
            if (member.permissions.has(permissions)) {
              await command.execute({
                client: this,
                member: interaction.member as GuildMember,
                channel: interaction.channel!,
                interaction: interaction as ChatInputCommandInteraction,
                options:
                  interaction.options as CommandInteractionOptionResolver,
              });
              break;
            } else {
              const roleIds = command.requiredRoles;
              if (!roleIds) {
                await interaction
                  .reply({
                    content:
                      "You do not have the required permissions to run this command !",
                    ephemeral: true,
                  })
                  .catch(null);
                break;
              }
              const hasRole = roleIds?.filter((roleId) =>
                member.roles.cache.has(roleId)
              );

              if (hasRole!.length > 0) {
                await command.execute({
                  client: this,
                  member: interaction.member as GuildMember,
                  channel: interaction.channel!,
                  interaction: interaction as ChatInputCommandInteraction,
                  options:
                    interaction.options as CommandInteractionOptionResolver,
                });
                break;
              } else {
                await interaction
                  .reply({
                    content:
                      "You do not have the required permissions to run this command !",
                    ephemeral: true,
                  })
                  .catch(null);
                break;
              }
            }

          case ApplicationCommandType.User:
            if (member.permissions.has(permissions)) {
              await command.execute({
                client: this,
                member: interaction.member as GuildMember,
                channel: interaction.channel!,
                interaction: interaction as ChatInputCommandInteraction,
                options:
                  interaction.options as CommandInteractionOptionResolver,
              });
              break;
            } else {
              const roleIds = command.requiredRoles;
              if (!roleIds) {
                await interaction
                  .reply({
                    content:
                      "You do not have the required permissions to run this command !",
                    ephemeral: true,
                  })
                  .catch(null);
                break;
              }
              const hasRole = roleIds?.filter((roleId) =>
                member.roles.cache.has(roleId)
              );

              if (hasRole!.length > 0) {
                await command.execute({
                  client: this,
                  member: interaction.member as GuildMember,
                  channel: interaction.channel!,
                  interaction: interaction as UserContextMenuCommandInteraction,
                });
                break;
              } else {
                await interaction
                  .reply({
                    content:
                      "You do not have the required permissions to run this command !",
                    ephemeral: true,
                  })
                  .catch(null);
                break;
              }
            }

          case ApplicationCommandType.Message:
            if (member.permissions.has(permissions)) {
              await command.execute({
                client: this,
                member: interaction.member as GuildMember,
                channel: interaction.channel!,
                interaction: interaction as ChatInputCommandInteraction,
                options:
                  interaction.options as CommandInteractionOptionResolver,
              });
              break;
            } else {
              const roleIds = command.requiredRoles;
              if (!roleIds) {
                await interaction
                  .reply({
                    content:
                      "You do not have the required permissions to run this command !",
                    ephemeral: true,
                  })
                  .catch(null);
                break;
              }
              const hasRole = roleIds?.filter((roleId) =>
                member.roles.cache.has(roleId)
              );

              if (hasRole!.length > 0) {
                await command.execute({
                  client: this,
                  member: interaction.member as GuildMember,
                  channel: interaction.channel!,
                  interaction:
                    interaction as MessageContextMenuCommandInteraction,
                });
                break;
              } else {
                await interaction
                  .reply({
                    content:
                      "You do not have the required permissions to run this command !",
                    ephemeral: true,
                  })
                  .catch(null);
                break;
              }
            }
        }
      }

      // Check if it is  a Button Interaction.
      else if (interaction.isButton()) {
        const button = this.buttonData.get(interaction.customId);
        if (!button) return;

        await button.run({
          client: this,
          interaction: interaction as ButtonInteraction,
        });
      }
    });
  }

  private async registerSlash(commands: ApplicationCommandData[]) {
    if (this.customData.testOnly) {
      console.log(
        `[+] Loaded ${commands.length} Guild Slash Command(s) in : \n`
      );
      // Register Guild Slash Commands !
      if (this.customData.guildId && Array.isArray(this.customData.guildId)) {
        // Loop through all the guild Ids !
        for (const guildId of this.customData.guildId) {
          const guild = this.guilds.cache.get(guildId);
          if (guild) {
            await guild.commands.set(commands);
            console.log(`${guild.name}`);
          } else {
            console.log(`[!] Could not find any guild with ${guildId} ID.`);
          }
        }
      } else
        throw new Error(
          "Please provide your test guild ids or disable testOnly."
        );
    } else {
      // Register Global Slash Commands !
      await this.application?.commands.set(commands);
      console.log(`\nRegistered ${commands.length} Global Slash Command(s) !`);
    }
  }

  private async startEvents() {
    if (!fs.existsSync(this.customData.eventsPath!)) return;
    if (!fs.lstatSync(this.customData.eventsPath!).isDirectory()) return;

    const eventFiles = fs
      .readdirSync(`${this.customData.eventsPath}`)
      .filter((file) => file.endsWith(".js"));
    if (eventFiles.length === 0) return;
    console.log("Events \n");
    for (const eventFile of eventFiles) {
      const event: Event<keyof ClientEvents> = await this.importFile(
        path.join(this.customData.eventsPath!, eventFile)
      );
      this.on(event.event, event.run);
      console.log(`${event.event} : ???\n`);
    }
  }
  private async registerCommands() {
    // Some checks.
    if (!fs.existsSync(`${this.customData.commandsPath}`))
      throw new Error(
        `[-] ${this.customData.commandsPath} is not a valid path !`
      );
    if (!fs.lstatSync(`${this.customData.commandsPath}`).isDirectory())
      throw new Error(
        `[-] ${this.customData.commandsPath} is not a Directory !`
      );

    const contents = fs.readdirSync(`${this.customData.commandsPath}`);
    const categories = contents.filter((c) =>
      fs.lstatSync(`${this.customData.commandsPath}/${c}`).isDirectory()
    ) as string[];
    if (categories.length > 0) {
      console.log("Commands \n");
      // For commands enclosed in various categories!

      for (const category of categories) {
        console.log(`${category}`);
        const files = fs
          .readdirSync(`${path.join(this.customData.commandsPath!, category)}`)
          .filter((file) => file.endsWith(".js"));
        for (const file of files) {
          const command: CommandOptions = await this.importFile(
            `${path.join(`${this.customData.commandsPath}`, category, file)}`
          );

          if (!command.name) continue;
          console.log(`${command.name} : ???`);
          this.commands.set(command.name, command);
        }
      }
      console.log(`Added ${this.commands.size} command(s) in total !\n`);
    } else {
      // For standalone command files.
      const files = fs
        .readdirSync(this.customData.commandsPath!)
        .filter((file) => file.endsWith(".js"));
      if (files.length > 0) {
        console.log("Commands \n");
        for (const file of files) {
          const command: CommandOptions = await this.importFile(
            `${path.join(`${this.customData.commandsPath}`, file)}`
          );

          if (!command.name) continue;
          console.log(`${command.name} : ???`);
          this.commands.set(command.name, command);
        }

        console.log(`Added ${this.commands.size} command(s) in total !\n`);
      }
    }

    if (this.commands.size > 0) {
      const slashCommands: ApplicationCommandData[] = [];

      // Filter the data !
      this.commands.forEach((command) => {
        if (
          command.mode === CommandMode.Both ||
          command.mode === CommandMode.Slash
        ) {
          if (
            command.type === ApplicationCommandType.User ||
            command.type === ApplicationCommandType.Message
          ) {
            delete command.description;
            slashCommands.push({
              name: command.name,
              type: command.type,
              options: command.options,
            });
          } else {
            if (!command.description)
              command.description = "Nothing Provided !";
            slashCommands.push({
              name: command.name,
              description: command.description,
              type: command.type,
              options: command.options,
            });
          }
        }
      });
      // Start up all the inits !
      this.commands.map(async (command) => {
        if (command.init) {
          await command.init({ client: this });
        }
      });
      // Call the registerSlash Function here !
      this.registerSlash(slashCommands).then(null);
    }
  }

  private async registerButtons() {
    if (!fs.existsSync(this.customData.buttonsPath!)) return;
    if (!fs.lstatSync(this.customData.buttonsPath!).isDirectory()) return;

    const buttonFiles = fs
      .readdirSync(this.customData.buttonsPath!)
      .filter((file) => file.endsWith(".js"));

    if (buttonFiles.length === 0) return;
    console.log("\nButtons");
    for (const file of buttonFiles) {
      const buttonFileData: ButtonOptions = await this.importFile(
        path.join(this.customData.buttonsPath!, file)
      );

      this.buttonData.set(buttonFileData.name, buttonFileData);
      console.log(`Loaded ${this.buttonData.size} button(s) !`);
    }
  }

  // Methods for Enhancing User Experience !

  public returnCommands() {
    // Returns the Collection of all commands !

    return this.commands;
  }

  public async basicMemberInfo(member: GuildMember) {
    const basicInfo = {
      "User ID": member.id,
      Username: member.user.username,
      "Guild ID ": member.guild.id,
      "Roles ": member.roles.cache.map((role) => role.name),
      "Avatar URL": `${member.user.avatarURL({ forceStatic: false })}`,
    };

    return basicInfo;
  }
}
