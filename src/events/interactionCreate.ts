import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    Events,
    GuildMemberRoleManager,
    type Interaction,
} from 'discord.js';
import { Event } from '../classes/event.js';
import type { ExtendedClient } from '../classes/client.js';
import { createRoleIfNotExists, removeExistingRoles } from '../utils/roles.js';
import { logger } from '../utils/logger.js';

interface ButtonConfig {
    id: string;
    roleName: string;
    style: ButtonStyle;
    label: string;
}

const PRONOUN_BUTTONS: ButtonConfig[] = [
    { id: 'multi_he_him', roleName: 'He/Him', style: ButtonStyle.Secondary, label: 'He/Him' },
    { id: 'multi_she_her', roleName: 'She/Her', style: ButtonStyle.Secondary, label: 'She/Her' },
    {
        id: 'multi_they_them',
        roleName: 'They_Them',
        style: ButtonStyle.Secondary,
        label: 'They/Them',
    },
    { id: 'multi_any_all', roleName: 'Any/All', style: ButtonStyle.Secondary, label: 'Any/All' },
    {
        id: 'multi_ask_me',
        roleName: 'Pronouns: Ask Me',
        style: ButtonStyle.Secondary,
        label: 'Ask Me',
    },
];

const YEAR_BUTTONS: ButtonConfig[] = [
    { id: 'year_0', roleName: 'Year 0', style: ButtonStyle.Secondary, label: 'Year 0' },
    { id: 'year_1', roleName: 'Year 1', style: ButtonStyle.Secondary, label: 'Year 1' },
    { id: 'year_2', roleName: 'Year 2', style: ButtonStyle.Secondary, label: 'Year 2' },
    { id: 'year_3', roleName: 'Year 3', style: ButtonStyle.Secondary, label: 'Year 3' },
    { id: 'year_4', roleName: 'Year 4', style: ButtonStyle.Secondary, label: 'Year 4' },
    { id: 'year_4plus', roleName: 'Year 4+', style: ButtonStyle.Secondary, label: 'Year 4+' },
];

const COURSES = [
    'Computer Science',
    'Software Engineering',
    'Cyber Security',
    'Games Development',
    'Data Science',
    'AI and Robotics',
] as const;

export default class InteractionCreate extends Event {
    constructor(client: ExtendedClient) {
        super(client, {
            name: Events.InteractionCreate,
            description: 'Handles button and select menu interactions',
            once: false,
        });
    }

    private async handlePronounButtons(interaction: Interaction) {
        if (!interaction.isButton()) return;

        const singlePronounIds = ['he_him', 'she_her', 'they_them', 'any_all', 'ask_me'];
        const pronounRoles = ['He/Him', 'She/Her', 'They/Them', 'Any/All', 'Pronouns: Ask Me'];

        if (
            singlePronounIds.includes(interaction.customId) ||
            interaction.customId.startsWith('multi_')
        ) {
            let roleName: string;

            if (interaction.customId.startsWith('multi_')) {
                roleName = interaction.customId.replace('multi_', '');
            } else {
                roleName = interaction.customId;
            }

            // Convert underscore to slash for role name
            roleName = roleName.replace('_', '/');

            // Special handling for 'ask_me'
            if (roleName === 'ask/me') {
                roleName = 'Pronouns: Ask Me';
            } else {
                // Convert role name to proper format for other pronouns
                roleName =
                    pronounRoles.find(r => r.toLowerCase() === roleName.toLowerCase()) || roleName;
            }

            const role = await createRoleIfNotExists(
                interaction.guild,
                roleName,
                'Created for pronouns selection'
            );
            const member = await interaction.guild.members.fetch(interaction.user.id);

            if (singlePronounIds.includes(interaction.customId)) {
                // For single pronoun selection, remove all other pronoun roles first
                await removeExistingRoles(interaction.guild, interaction.user.id, pronounRoles);
                await member.roles.add(role);
                await interaction.reply({
                    content: `Set your pronouns to ${roleName}`,
                    ephemeral: true,
                });
            } else {
                // For multi-pronoun selection, toggle the role
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                    await interaction.reply({
                        content: `Removed ${roleName} role`,
                        ephemeral: true,
                    });
                } else {
                    await member.roles.add(role);
                    await interaction.reply({
                        content: `Added ${roleName} role`,
                        ephemeral: true,
                    });
                }
            }
            return;
        }

        if (interaction.customId === 'select_multiple') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Select your preferred pronouns');

            const pronounButtons = PRONOUN_BUTTONS.map(button => {
                const memberRoles = interaction.member?.roles as GuildMemberRoleManager;
                const hasRole = memberRoles.cache.some(r => r.name === button.roleName);
                return new ButtonBuilder()
                    .setCustomId(button.id)
                    .setLabel(button.label)
                    .setStyle(hasRole ? ButtonStyle.Primary : ButtonStyle.Secondary);
            });

            const clearButton = new ButtonBuilder()
                .setCustomId('clear_pronouns')
                .setLabel('🗑️ Clear')
                .setStyle(ButtonStyle.Danger);

            await interaction.reply({
                embeds: [embed],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(pronounButtons),
                    new ActionRowBuilder<ButtonBuilder>().addComponents([clearButton]),
                ],
                ephemeral: true,
            });
            return;
        }

        if (interaction.customId === 'clear_pronouns') {
            await removeExistingRoles(interaction.guild, interaction.user.id, pronounRoles);
            await interaction.reply({ content: 'Pronoun roles cleared!', ephemeral: true });
            return;
        }

        if (interaction.customId === 'ask_me') {
            const role = await createRoleIfNotExists(
                interaction.guild,
                'Pronouns: Ask Me',
                'Created for pronouns selection'
            );
            const member = await interaction.guild.members.fetch(interaction.user.id);
            await member.roles.add(role);
            await interaction.reply({ content: 'Ask Me pronouns role added!', ephemeral: true });
            return;
        }

        // Handle multi-pronoun toggles
        const button = PRONOUN_BUTTONS.find(b => b.id === interaction.customId);
        if (button) {
            const role = await createRoleIfNotExists(
                interaction.guild,
                button.roleName,
                'Created for pronouns selection'
            );
            const member = await interaction.guild.members.fetch(interaction.user.id);

            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                await interaction.reply({
                    content: `Removed ${button.roleName} role`,
                    ephemeral: true,
                });
            } else {
                await member.roles.add(role);
                await interaction.reply({
                    content: `Added ${button.roleName} role`,
                    ephemeral: true,
                });
            }
        }
    }

    private async handleYearButtons(interaction: Interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'select_year') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Select your year of study');

            const yearButtons = YEAR_BUTTONS.map(button =>
                new ButtonBuilder()
                    .setCustomId(button.id)
                    .setLabel(button.label)
                    .setStyle(button.style)
            );

            const rows = [];
            for (let i = 0; i < yearButtons.length; i += 3) {
                rows.push(
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        yearButtons.slice(i, Math.min(i + 3, yearButtons.length))
                    )
                );
            }

            await interaction.reply({
                embeds: [embed],
                components: rows,
                ephemeral: true,
            });
            return;
        }

        const button = YEAR_BUTTONS.find(b => b.id === interaction.customId);
        if (button) {
            const role = await createRoleIfNotExists(
                interaction.guild,
                button.roleName,
                'Created for year selection'
            );
            const member = await interaction.guild.members.fetch(interaction.user.id);

            // Remove any existing year roles first
            await removeExistingRoles(
                interaction.guild,
                interaction.user.id,
                YEAR_BUTTONS.map(b => b.roleName)
            );

            await member.roles.add(role);
            await interaction.reply({
                content: `Updated your year to ${button.roleName}`,
                ephemeral: true,
            });
        }
    }

    private async handleCourseSelect(interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) return;

        if (interaction.customId === 'select_course') {
            const selectedCourse = interaction.values[0];
            const role = await createRoleIfNotExists(
                interaction.guild,
                selectedCourse,
                'Created for course selection'
            );

            const member = await interaction.guild.members.fetch(interaction.user.id);

            // Remove any existing course roles first
            await removeExistingRoles(interaction.guild, interaction.user.id, [...COURSES]);

            await member.roles.add(role);
            await interaction.reply({
                content: `Updated your course to ${selectedCourse}`,
                ephemeral: true,
            });
        }
    }

    override async execute(interaction: Interaction): Promise<void> {
        if (!interaction.guild) {
            await (interaction as ButtonInteraction).reply({
                content: 'This command can only be used in a server',
                ephemeral: true,
            });
        }

        try {
            await this.handlePronounButtons(interaction);
            await this.handleYearButtons(interaction);
            await this.handleCourseSelect(interaction);
        } catch (error) {
            logger.error('Failed to handle interaction', error);
            if (interaction.isRepliable() && !interaction.replied) {
                await interaction.reply({
                    content: 'Failed to handle interaction',
                    ephemeral: true,
                });
            }
        }
    }
}
