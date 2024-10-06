import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import type { ExtendedClient } from '../../classes/client.js';
import Command from '../../classes/command.js';
import { Category } from '../../enums/Category.js';

export default class Ping extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            name: 'ping',
            description: 'Replies with Pong!',
            category: Category.Utility,
            options: [],
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permission: true,
            cooldown: 5,
        });
    }

    override async execute(interaction: ChatInputCommandInteraction) {
        const sent = await interaction.reply({
            content: 'Pinging...',
            fetchReply: true,
            ephemeral: true,
        });

        interaction.editReply({
            content: `Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`,
        });
    }
}
