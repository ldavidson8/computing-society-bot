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
} from 'discord.js';
import type { Command } from '../interfaces/command.js';

const metadata = new SlashCommandBuilder()
    .setName('pronouns')
    .setDescription('Set your preferred pronouns');

async function execute(interaction: CommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Set Your Pronouns')
        .setDescription('Click the buttons below to add or remove pronoun roles.');

    const buttons = [
        new ButtonBuilder().setCustomId('he_him').setLabel('He/Him').setStyle(ButtonStyle.Primary),
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
        if (!interaction.guild) {
            await i.reply({ content: 'Guild not found', ephemeral: true });
            return;
        }
        const role = interaction.guild.roles.cache.find(
            r => r.name === i.customId.replace('_', '/')
        );
        if (!role) {
            await i.reply({ content: 'Role not found', ephemeral: true });
            return;
        }

        if (
            i.member &&
            i.member.roles instanceof GuildMemberRoleManager &&
            i.member.roles.cache.has(role.id)
        ) {
            await (i.member.roles as GuildMemberRoleManager).remove(role);
            await i.reply({ content: `Removed ${role.name} role`, ephemeral: true });
        } else {
            if (i.member) {
                if (i.member.roles instanceof GuildMemberRoleManager) {
                    await i.member.roles.add(role);
                } else {
                    await i.reply({ content: 'Roles manager not found', ephemeral: true });
                }
            } else {
                await i.reply({ content: 'Member not found', ephemeral: true });
            }
            await i.reply({ content: `Added ${role.name} role`, ephemeral: true });
        }
    });

    collector.on('end', () => {
        interaction.editReply({ components: [] });
    });
}

const pronounsCommand: Command = {
    data: metadata.toJSON(),
    execute,
};

export default pronounsCommand;
