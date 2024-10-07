import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionsBitField,
} from 'discord.js';
import type { ExtendedClient } from '../../classes/client.js';
import Command from '../../classes/command.js';
import { Category } from '../../enums/Category.js';

export default class YearCommand extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            name: 'year',
            description: 'Select your year of study',
            category: Category.RoleManagement,
            options: [],
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permission: false,
            cooldown: 5,
        });
    }

    override async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Year prompt')
            .setDescription('Select your current year of study');

        const buttons = [
            new ButtonBuilder()
                .setCustomId('year_0')
                .setLabel('Year 0')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('year_1')
                .setLabel('Year 1')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('year_2')
                .setLabel('Year 2')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('year_3')
                .setLabel('Year 3')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('year_4')
                .setLabel('Year 4')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('year_4plus')
                .setLabel('Year 4+')
                .setStyle(ButtonStyle.Primary),
        ];

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(0, 3));
        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(3));

        await interaction.reply({
            embeds: [embed],
            components: [row1, row2],
        });
    }
}
