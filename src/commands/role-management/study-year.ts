import {
    CommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    Guild,
    GuildMemberRoleManager,
    ButtonInteraction,
    Role,
    ComponentType,
    TextChannel,
    Message,
    type PartialMessage,
} from 'discord.js';
import type { Command } from '../../interfaces/command.js';
import { logger } from '../../utils/logger.js';

const metadata = new SlashCommandBuilder()
    .setName('study-year')
    .setDescription('Set your current study year');

const studyYears = ['Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 4+'];

async function execute(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) {
        await interaction.reply({
            content: 'This command can only be used in a server',
            ephemeral: true,
        });
        return;
    }

    await createStudyYearRoles(interaction.guild);

    const buttons = studyYears.map(year =>
        new ButtonBuilder().setCustomId(year).setLabel(year).setStyle(ButtonStyle.Primary)
    );

    const rows = [];
    for (let i = 0; i < buttons.length; i += 3) {
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + 3)));
    }

    await interaction.reply({
        content: 'Please select your current study year:',
        components: rows,
    });

    if (!interaction.channel) {
        await interaction.reply({
            content: 'This command can only be used in a text channel',
            ephemeral: true,
        });
    }

    const collector = (interaction.channel as TextChannel).createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: i =>
            studyYears.includes(i.customId) && i.message.interactionMetadata?.id === interaction.id,
    });

    const messageDeleteListener = async (deletedMessage: Message | PartialMessage) => {
        if (deletedMessage.id === interaction.id) {
            collector.stop('Message deleted');
            interaction.client.removeListener('messageDelete', messageDeleteListener);
        }
    };

    interaction.client.on('messageDelete', messageDeleteListener);

    collector.on('collect', async (i: ButtonInteraction) => {
        await handleStudyYearSelection(i);
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'Message deleted') {
            logger.info('Collector stopped due to message deletion');
        }
        interaction.client.removeListener('messageDelete', messageDeleteListener);
    });
}

async function handleStudyYearSelection(i: ButtonInteraction) {
    if (!i.guild || !i.member) return;

    const selectedYear = i.customId;
    const member = i.member;
    const roles = member.roles as GuildMemberRoleManager;

    // Remove existing study year roles
    const existingYearRoles = roles.cache.filter(role => studyYears.includes(role.name));
    await roles.remove(existingYearRoles);

    // Add the selected study year role
    let role = i.guild.roles.cache.find(r => r.name === selectedYear);
    if (!role) {
        role = await createRole(i.guild, selectedYear);
    }
    if (role) {
        await roles.add(role);
    }

    await i.update({
        content: role
            ? `Your study year has been set to: ${role.name}`
            : 'Study year role could not be set.',
        components: [],
    });
}

async function createRole(guild: Guild, roleName: string): Promise<Role> {
    try {
        const role = await guild.roles.create({
            name: roleName,
            reason: 'Created for study year selection',
        });
        return role;
    } catch (error) {
        logger.error(`Failed to create role "${roleName}": ${error}`);
        throw error;
    }
}

async function createStudyYearRoles(guild: Guild): Promise<void> {
    for (const roleName of studyYears) {
        if (!guild.roles.cache.some(role => role.name === roleName)) {
            try {
                await createRole(guild, roleName);
                logger.info(`Created role: ${roleName}`);
            } catch (error) {
                logger.error(`Failed to create role ${roleName}:`, error);
            }
        }
    }
}

const studyYearCommand: Command = {
    data: metadata.toJSON(),
    execute,
};

export default studyYearCommand;
