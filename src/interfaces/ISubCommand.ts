import type { ChatInputCommandInteraction } from 'discord.js';

import type { ExtendedClient } from '../classes/client.js';

export interface ISubCommand {
    client: ExtendedClient;
    name: string;

    execute: (interaction: ChatInputCommandInteraction) => void;
}
