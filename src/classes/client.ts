import { Client, Collection, GatewayIntentBits } from 'discord.js';

import { env } from '../env.js';
import { logger } from '../utils/logger.js';

import { Handler } from './handler.js';
import type Command from './command.js';
import type { Button } from './button.js';
import type { SubCommand } from './subcommand.js';

export class ExtendedClient extends Client {
    handlers: Handler;
    commands = new Collection<string, Command>();
    subCommands = new Collection<string, SubCommand>();
    buttons = new Collection<string, Button>();
    cooldowns = new Collection<string, Collection<string, number>>();
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
        this.handlers = new Handler(this);
    }

    async start() {
        await this.loadHandlers();
        await this.login(env.DISCORD_TOKEN).catch(error => logger.error(error));
    }

    async loadHandlers() {
        await this.handlers.LoadEvents();
        await this.handlers.LoadCommands();
        await this.handlers.LoadButtons();
    }
}
