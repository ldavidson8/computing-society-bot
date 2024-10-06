import type { IHandler } from '../interfaces/IHandler.js';

import FastGlob from 'fast-glob';
import type { ExtendedClient } from './client.js';
import type { Event } from './event.js';
import { logger } from '../utils/logger.js';
import type Command from './command.js';
import type { Button } from './button.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export class Handler implements IHandler {
    client: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.client = client;
    }

    private get basePath() {
        const __filename = fileURLToPath(import.meta.url);
        return dirname(dirname(__filename));
    }

    async LoadEvents(): Promise<void> {
        const eventsPath = join(this.basePath, 'events');
        const files = FastGlob.sync('**/*.js', { cwd: eventsPath });

        logger.info(`Looking for events in: ${eventsPath}`);
        logger.info(`Found event files: ${files.join(', ')}`);

        for (const file of files) {
            const path = join(eventsPath, file);
            try {
                logger.info(`Loading event from: ${path}`);
                const { default: EventClass } = await import(path);
                const event: Event = new EventClass(this.client);

                if (!event.name) {
                    logger.warn(`⚠️ Event name not found in ${path}`);
                    continue;
                }

                const execute = async (...args: unknown[]) => event.execute(...args);
                if (event.once) {
                    this.client.once(event.name.toString(), execute);
                } else {
                    this.client.on(event.name.toString(), execute);
                }
                logger.info(`✅ Loaded event: ${event.name}`);
            } catch (error) {
                logger.error(`Failed to load event ${path}:`, error);
            }
        }
    }

    async LoadCommands(): Promise<void> {
        const commandsPath = join(this.basePath, 'commands');
        const files = FastGlob.sync('**/*.js', { cwd: commandsPath });

        logger.info(`Looking for commands in: ${commandsPath}`);
        logger.info(`Found command files: ${files.join(', ')}`);

        for (const file of files) {
            const path = join(commandsPath, file);
            try {
                logger.info(`Loading command from: ${path}`);
                const { default: CommandClass } = await import(path);
                const command: Command = new CommandClass(this.client);

                if (!command.name) {
                    logger.warn(`⚠️ Command name not found in ${path}`);
                    continue;
                }

                if (command.name.includes('.')) {
                    this.client.subCommands.set(command.name, command);
                    logger.info(`✅ Loaded subcommand: ${command.name}`);
                } else {
                    this.client.commands.set(command.name, command);
                    logger.info(`✅ Loaded command: ${command.name}`);
                }
            } catch (error) {
                logger.error(`Failed to load command ${path}:`, error);
                logger.error('Error details:', error);
            }
        }

        logger.info(
            `Loaded ${this.client.commands.size} commands and ${this.client.subCommands.size} subcommands`
        );
    }

    async LoadButtons(): Promise<void> {
        const buttonsPath = join(this.basePath, 'buttons');
        const files = FastGlob.sync('**/*.js', { cwd: buttonsPath });

        logger.info(`Looking for buttons in: ${buttonsPath}`);
        logger.info(`Found button files: ${files.join(', ')}`);

        for (const file of files) {
            const path = join(buttonsPath, file);
            try {
                logger.info(`Loading button from: ${path}`);
                const { default: ButtonClass } = await import(path);
                const button: Button = new ButtonClass(this.client);

                if (!button.id) {
                    logger.warn(`⚠️ Button id not found in ${path}`);
                    continue;
                }

                this.client.buttons.set(button.id, button);
                logger.info(`✅ Loaded button: ${button.id}`);
            } catch (error) {
                logger.error(`Failed to load button ${path}:`, error);
            }
        }

        logger.info(`Loaded ${this.client.buttons.size} buttons`);
    }
}
