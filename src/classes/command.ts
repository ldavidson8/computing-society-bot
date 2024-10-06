import { PermissionsBitField, type ChatInputCommandInteraction } from 'discord.js';
import type { Category } from '../enums/Category.js';
import type { ICommand } from '../interfaces/ICommand.js';
import type { ICommandOption } from '../interfaces/ICommandOption.js';
import type { ICommandOptions } from '../interfaces/ICommandOptions.js';
import type { ExtendedClient } from './client.js';

export default class Command implements ICommand {
    client: ExtendedClient;

    name: string;

    description: string;

    category: Category;

    options: ICommandOption[];

    default_member_permissions: bigint;

    dm_permission: boolean;

    cooldown: number;

    constructor(client: ExtendedClient, options: ICommandOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.options = options.options;
        this.default_member_permissions =
            options.default_member_permissions ?? PermissionsBitField.Flags.UseApplicationCommands;
        this.dm_permission = options.dm_permission;
        this.cooldown = options.cooldown ?? 3;
    }

    async execute(interaction: ChatInputCommandInteraction) {
        throw new Error(`Execute not implemented in ${interaction.command?.name} command`);
    }
}
