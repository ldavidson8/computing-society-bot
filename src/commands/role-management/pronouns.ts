import {
    CommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    Guild,
} from 'discord.js';
import type { Command } from '../../interfaces/command.js';

const metadata = new SlashCommandBuilder()
    .setName('pronouns')
    .setDescription('Set your preferred pronouns');

async function execute(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) {
        await interaction.reply({
            content: 'This command can only be used in a server',
            ephemeral: true,
        });
        return;
    }

    // Create pronoun roles if they don't exist
    await createPronounRoles(interaction.guild);

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Set Your Pronouns')
        .setDescription('Click the buttons below to add or remove pronoun roles.');

    const buttons = [
        new ButtonBuilder().setCustomId('He/Him').setLabel('He/Him').setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('She/Her')
            .setLabel('She/Her')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('They/Them')
            .setLabel('They/Them')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('Any/All')
            .setLabel('Any/All')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('Pronouns: Ask Me')
            .setLabel('Ask Me')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('select_multiple')
            .setLabel('Select Multiple')
            .setStyle(ButtonStyle.Secondary),
    ];

    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) {
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + 3)));
    }

    await interaction.reply({ embeds: [embed], components: rows });
}

async function createPronounRoles(guild: Guild): Promise<void> {
    const pronounRoles = ['He/Him', 'She/Her', 'They/Them', 'Any/All', 'Pronouns: Ask Me'];

    for (const roleName of pronounRoles) {
        if (!guild.roles.cache.some(role => role.name === roleName)) {
            try {
                await guild.roles.create({
                    name: roleName,
                    reason: 'Created for pronoun selection',
                });
                console.log(`Created role: ${roleName}`);
            } catch (error) {
                console.error(`Failed to create role ${roleName}:`, error);
            }
        }
    }
}

const pronounsCommand: Command = {
    data: metadata.toJSON(),
    execute,
};

export default pronounsCommand;
