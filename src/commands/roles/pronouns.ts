import { Category } from '../../enums/Category.js';
import Command from '../../classes/command.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';
import type { ExtendedClient } from '../../classes/client.js';

export default class PronounsCommand extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            name: 'pronouns',
            description: 'Set your pronouns',
            category: Category.RoleManagement,
            options: [],
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permission: true,
            cooldown: 5,
        });
    }

    override async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: 'This command can only be used in a server',
                ephemeral: true,
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Pronouns prompt')
            .setDescription('Click the buttons below to set your pronouns');

        const buttons = [
            new ButtonBuilder()
                .setCustomId('he_him')
                .setLabel('He/Him')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('she_her')
                .setLabel('She/Her')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('they_them')
                .setLabel('They/Them')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('any_all')
                .setLabel('Any/All')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ask_me')
                .setLabel('Ask Me')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('select_multiple')
                .setLabel('Select multiple')
                .setStyle(ButtonStyle.Secondary),
        ];

        const rows = [];
        for (let i = 0; i < buttons.length; i += 3) {
            rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + 3)));
        }

        await interaction.reply({
            embeds: [embed],
            components: rows,
        });
    }
}
