import { ChatInputCommandInteraction } from 'discord.js';

import type { ExtendedClient } from '../classes/client.js';
import type { Category } from '../enums/Category.js';

export interface ICommand {
    client: ExtendedClient;
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    dm_permission: boolean;
    cooldown: number;

    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
