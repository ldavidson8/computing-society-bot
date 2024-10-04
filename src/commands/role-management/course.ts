import {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    CommandInteraction,
    PermissionsBitField,
    StringSelectMenuInteraction,
    GuildMemberRoleManager,
    Guild,
    Role,
    TextChannel,
    ComponentType,
    Message,
    type PartialMessage,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import type { Command } from '../../interfaces/command.js';
import { logger } from '../../utils/logger.js';

const courses = [
    'Software Engineering',
    'Computer Science',
    'Cyber Security',
    'Games Development',
    'Networking',
    'Computing',
    'Masters',
    'BAE',
    'Engineering',
    'Electronics Engineering',
    'Robotics Engineering',
    'Other',
];

const rateLimiter = new RateLimiter(1, 5000); // 1 interaction per 5 seconds

const metadata = new SlashCommandBuilder()
    .setName('course')
    .setDescription('Manage course roles')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

async function execute(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guild) {
        await interaction.reply({
            content: 'This command can only be used in a server',
            ephemeral: true,
        });
        return;
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('course-select')
        .setPlaceholder('Select your course')
        .addOptions(
            courses.map(course => ({
                label: course,
                value: course.toLowerCase().replace(/\s+/g, '-'),
            }))
        );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
        content: 'Please select your course:',
        components: [row],
    });

    if (!interaction.channel) {
        await interaction.reply({
            content: 'Channel not found.',
            ephemeral: true,
        });
        return;
    }

    const collector = (interaction.channel as TextChannel).createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i: StringSelectMenuInteraction) =>
            i.customId === 'course-select' && i.user.id === interaction.user.id,
    });

    const messageDeleteListener = async (deletedMessage: Message | PartialMessage) => {
        if (deletedMessage.id === interaction.id) {
            collector.stop('Message deleted');
            interaction.client.removeListener('messageDelete', messageDeleteListener);
        }
    };

    interaction.client.on('messageDelete', messageDeleteListener);

    collector.on('collect', async (i: StringSelectMenuInteraction) => {
        await handleCourseSelection(i);
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'messageDeleted') {
            logger.info('Collector stopped due to message deletion');
        }
        interaction.client.removeListener('messageDelete', messageDeleteListener);
    });
}

async function handleCourseSelection(interaction: StringSelectMenuInteraction) {
    if (!interaction.guild || !interaction.member) return;

    const limited = rateLimiter.take(interaction.user.id);
    if (limited) {
        await interaction.reply({
            content: 'You are switching courses too quickly. Please wait a moment.',
            ephemeral: true,
        });
        return;
    }

    const selectedCourse = interaction.values[0];
    const member = interaction.member;
    const roles = member.roles as GuildMemberRoleManager;

    // Remove existing course roles
    const existingCourseRoles = roles.cache.filter(role =>
        courses
            .map(c => c.toLowerCase().replace(/\s+/g, '-'))
            .includes(role.name.toLowerCase().replace(/\s+/g, '-'))
    );
    await roles.remove(existingCourseRoles);

    // Add the selected course role
    let role = interaction.guild.roles.cache.find(
        r => r.name.toLowerCase().replace(/\s+/g, '-') === selectedCourse
    );
    if (!role) {
        if (selectedCourse) {
            role = await createRole(interaction.guild, selectedCourse);
        }
    }
    if (role) {
        await roles.add(role);
    }

    await interaction.reply({
        content: role
            ? `Your course has been set to: ${role.name}`
            : 'Course role could not be set.',
        ephemeral: true,
    });
}

async function createRole(guild: Guild, courseName: string): Promise<Role> {
    return await guild.roles.create({
        name: courseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: 'Created for course selection',
    });
}

const courseCommand: Command = {
    data: metadata.toJSON(),
    execute,
};

export default courseCommand;
