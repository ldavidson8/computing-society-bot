import type { CacheType, ChatInputCommandInteraction } from 'discord.js';

import type { ISubCommand } from '../interfaces/ISubCommand.js';
import type { ISubCommandOptions } from '../interfaces/ISubCommandOptions.js';

import type { ExtendedClient } from './client.js';

export class SubCommand implements ISubCommand {
    public client: ExtendedClient;
    public name: string;

    constructor(client: ExtendedClient, options: ISubCommandOptions) {
        this.client = client;
        this.name = options.name;
    }

    async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        throw new Error(`Execute not implemented in ${interaction.command?.name} subcommand.`);
    }
}
