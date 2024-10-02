import {
    CommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    TextChannel,
    GuildMemberRoleManager,
    ButtonInteraction,
    type CacheType,
    ComponentType,
    Guild,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    GuildMember,
} from 'discord.js';
import type { Command } from '../interfaces/command.js';

const activeSelectors = new Map<string, boolean>();

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

    const filter = (i: ButtonInteraction<CacheType>) => i.user.id === interaction.user.id;
    if (!interaction.channel) {
        await interaction.reply({ content: 'Channel not found', ephemeral: true });
        return;
    }
    const collector = (interaction.channel as TextChannel).createMessageComponentCollector({
        filter,
        time: 60000,
        componentType: ComponentType.Button,
    });

    collector.on('collect', async i => {
        if (i.customId === 'select_multiple') {
            await handleMultiplePronouns(i);
        } else {
            await handleSinglePronoun(i);
        }
    });

    collector.on('end', () => {
        interaction.editReply({ components: [] });
    });
}

async function handleMultiplePronouns(i: ButtonInteraction) {
    if (!i.guild) {
        await i.reply({ content: 'Guild not found', ephemeral: true });
        return;
    }

    const userId = i.user.id;

    // Check if the user already has an active selector
    if (activeSelectors.get(userId)) {
        await i.reply({
            content: 'You already have an active pronoun selector. Please use that one.',
            ephemeral: true,
        });
        return;
    }

    // Fetch all roles
    await i.guild.roles.fetch();

    const pronounRoles = ['He/Him', 'She/Her', 'They/Them', 'Any/All', 'Pronouns: Ask Me'];
    const options = pronounRoles.map(role => ({
        label: role,
        value: role,
    }));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`pronoun_select_${userId}`)
            .setPlaceholder('Select your pronouns')
            .setMinValues(1)
            .setMaxValues(pronounRoles.length)
            .addOptions(options)
    );

    await i.reply({
        content: 'Select your pronouns:',
        components: [row],
        ephemeral: true,
    });

    // Mark this user as having an active selector
    activeSelectors.set(userId, true);

    const filter = (interaction: StringSelectMenuInteraction) =>
        interaction.customId === `pronoun_select_${userId}` && interaction.user.id === userId;

    const collector = (i.channel as TextChannel)?.createMessageComponentCollector({
        filter,
        time: 300000, // 5 minutes
        componentType: ComponentType.StringSelect,
    });

    collector?.on('collect', async (selectInteraction: StringSelectMenuInteraction) => {
        const selectedRoles = selectInteraction.values;
        const member = selectInteraction.member as GuildMember;

        for (const roleName of pronounRoles) {
            const role = i.guild?.roles.cache.find(r => r.name === roleName);
            if (role) {
                if (selectedRoles.includes(roleName)) {
                    if (!member.roles.cache.has(role.id)) {
                        await member.roles.add(role);
                    }
                } else {
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                    }
                }
            }
        }

        await selectInteraction.update({
            content: 'Roles updated! You can select again to modify your choices.',
            components: [row],
        });
    });

    collector?.on('end', () => {
        i.editReply({ content: 'Pronoun selection has ended.', components: [] });
        // Remove the user from active selectors
        activeSelectors.delete(userId);
    });
}

async function handleSinglePronoun(i: ButtonInteraction) {
    let roleName = i.customId;
    if (roleName === 'Pronouns: Ask Me') {
        roleName = 'Pronounds: Ask Me';
    }
    if (!i.guild) {
        await i.reply({ content: 'Guild not found', ephemeral: true });
        return;
    }

    await i.guild.roles.fetch();

    const pronounRoles = ['He/Him', 'She/Her', 'They/Them', 'Any/All', 'Pronouns: Ask Me'];
    const selectedRole = i.guild.roles.cache.find(r => r.name === roleName);

    if (!selectedRole) {
        await i.reply({ content: `Role "${roleName}" not found`, ephemeral: true });
        return;
    }

    if (i.member && i.member.roles instanceof GuildMemberRoleManager) {
        // Remove all pronoun roles
        for (const pronounRoleName of pronounRoles) {
            const roleToRemove = i.guild.roles.cache.find(r => r.name === pronounRoleName);
            if (roleToRemove && i.member.roles.cache.has(roleToRemove.id)) {
                await i.member.roles.remove(roleToRemove);
            }
        }

        // Add the selected role
        await i.member.roles.add(selectedRole);

        await i.reply({
            content: `Your preferred pronoun has been updated to ${roleName}`,
            ephemeral: true,
        });
    } else {
        await i.reply({ content: 'Failed to update pronoun', ephemeral: true });
    }
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
