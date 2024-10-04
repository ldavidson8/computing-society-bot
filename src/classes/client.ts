import {
    ButtonComponent,
    Client,
    Collection,
    GatewayIntentBits,
    StringSelectMenuComponent,
} from 'discord.js';
import { env } from '../env.js';
import type { Command } from '../interfaces/command.js';
import type { Event } from '../interfaces/event.js';
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { logger } from '../utils/logger.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export class ExtendedClient extends Client {
    commands: Collection<string, Command>;
    buttons: Collection<string, ButtonComponent>;
    selectMenus: Collection<string, StringSelectMenuComponent>;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
            ],
            failIfNotExists: true,
            rest: {
                retries: 3,
                timeout: 15_000,
            },
        });
        this.commands = new Collection<string, Command>();
        this.buttons = new Collection<string, ButtonComponent>();
        this.selectMenus = new Collection<string, StringSelectMenuComponent>();
    }

    start() {
        this.loadCommands();
        this.loadEvents();
        this.login(env.DISCORD_TOKEN);
    }

    private async loadCommands() {
        const commandFolderPath = join(__dirname, '..', 'commands');
        this.loadCommandFiles(commandFolderPath);
    }

    private async loadCommandFiles(folderPath: string) {
        const entries = readdirSync(folderPath);

        for (const entry of entries) {
            const entryPath = join(folderPath, entry);
            const entryStat = statSync(entryPath);

            if (entryStat.isDirectory()) {
                await this.loadCommandFiles(entryPath);
            } else if (entryStat.isFile() && entry.endsWith('.js')) {
                try {
                    const commandModule = await import(entryPath);
                    const command = commandModule.default as Command;

                    if ('data' in command && 'execute' in command) {
                        this.commands.set(command.data.name, command);
                        logger.info(`Command ${command.data.name} loaded`);
                    } else {
                        logger.warn(
                            `[WARNING] The command at ${entryPath} is missing a required "data" or "execute" property.`
                        );
                    }
                } catch (error) {
                    logger.error(`Failed to load command ${entry}:`, error);
                }
            }
        }
    }

    private async loadEvents() {
        const eventFolderPath = join(__dirname, '..', 'events');
        const eventFiles = readdirSync(eventFolderPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = join(eventFolderPath, file);
            try {
                const eventModule = await import(filePath);
                const event = eventModule.default as Event;

                if (event.once) {
                    this.once(event.name, (...args) => event.execute(this, ...args));
                } else {
                    this.on(event.name, (...args) => event.execute(this, ...args));
                }

                logger.info(`Event ${event.name} loaded`);
            } catch (error) {
                logger.error(`Failed to load event ${file}:`, error);
            }
        }
    }

    private async loadComponents() {
        const componentFolderPath = join(__dirname, '..', 'components');
        await this.loadComponentFiles(componentFolderPath);
    }

    private async loadComponentFiles(folderPath: string) {
        const entries = readdirSync(folderPath);

        for (const entry of entries) {
            const entryPath = join(folderPath, entry);
            const entryStat = statSync(entryPath);

            if (entryStat.isDirectory()) {
                await this.loadComponentFiles(entryPath);
            } else if (entryStat.isFile() && entry.endsWith('.js')) {
                try {
                    const componentModule = await import(entryPath);
                    const component = componentModule.default;

                    if (component instanceof ButtonComponent) {
                        this.buttons.set(component.customId, component);
                    } else if (component instanceof StringSelectMenuComponent) {
                        this.selectMenus.set(component.customId, component);
                    }

                    logger.info(`Component ${component.customId} loaded`);
                } catch (error) {
                    logger.error(`Failed to load component ${entry}:`, error);
                }
            }
        }
    }
}
