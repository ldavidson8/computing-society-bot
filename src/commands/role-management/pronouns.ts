import {
    CommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    Guild,
    ButtonInteraction,
    GuildMember,
    GuildMemberRoleManager,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ComponentType,
    TextChannel,
    Message,
    type PartialMessage,
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

    const reply = await interaction.reply({ embeds: [embed], components: rows, fetchReply: true });

    const collector = (interaction.channel as TextChannel).createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i: ButtonInteraction) => i.user.id === interaction.user.id,
    });

    collector.on('collect', async (i: ButtonInteraction | StringSelectMenuInteraction) => {
        if (i.isButton()) {
            if (i.customId === 'select_multiple') {
                await handleMultiplePronouns(i);
            } else {
                await handleSinglePronoun(i);
            }
        } else if (i.isStringSelectMenu()) {
            if (i.customId.startsWith('pronoun_select_')) {
                await handlePronounSelection(i);
            }
        }
    });

    const messageDeleteListener = async (deletedMessage: Message | PartialMessage) => {
        if (deletedMessage.id === reply.id) {
            collector.stop();
            interaction.client.removeListener('messageDelete', messageDeleteListener);
        }
    };

    interaction.client.on(
        'messageDelete',
        messageDeleteListener as (message: Message | PartialMessage) => void
    );

    // Handle the end of the collector
    collector.on('end', () => {
        interaction.client.removeListener('messageDelete', messageDeleteListener);
    });
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

const pronounRoles = ['He/Him', 'She/Her', 'They/Them', 'Any/All', 'Pronouns: Ask Me'];

export async function handleMultiplePronouns(i: ButtonInteraction) {
    if (!i.guild) {
        await i.reply({ content: 'Guild not found', ephemeral: true });
        return;
    }

    const userId = i.user.id;

    // Fetch all roles
    await i.guild.roles.fetch();

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
}

export async function handleSinglePronoun(i: ButtonInteraction) {
    let roleName = i.customId;
    if (roleName === 'Pronouns: Ask Me') {
        roleName = 'Pronouns: Ask Me';
    }
    if (!i.guild) {
        await i.reply({ content: 'Guild not found', ephemeral: true });
        return;
    }

    await i.guild.roles.fetch();

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

export async function handlePronounSelection(selectInteraction: StringSelectMenuInteraction) {
    const selectedRoles = selectInteraction.values;
    const member = selectInteraction.member as GuildMember;

    if (!selectInteraction.guild) {
        await selectInteraction.reply({ content: 'Guild not found', ephemeral: true });
        return;
    }

    for (const roleName of pronounRoles) {
        const role = selectInteraction.guild?.roles.cache.find(r => r.name === roleName);
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
        components: selectInteraction.message.components,
    });
}

const pronounsCommand: Command = {
    data: metadata.toJSON(),
    execute,
};

export default pronounsCommand;
