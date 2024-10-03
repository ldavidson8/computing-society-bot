import {
    CommandInteraction,
    SlashCommandBuilder,
    TextChannel,
    CommandInteractionOptionResolver,
} from 'discord.js';
import type { Command } from '../../interfaces/command.js';

const metadata = new SlashCommandBuilder()
    .setName('question')
    .setDescription('Ask an anonymous question to the server')
    .addStringOption(option =>
        option.setName('question').setDescription('The question you want to ask').setRequired(true)
    );

async function execute(interaction: CommandInteraction): Promise<void> {
    const options = interaction.options as CommandInteractionOptionResolver;
    const question = options.getString('question', true);

    const targetChannelId = '1291087975085506689';
    const targetChannel = interaction.guild?.channels.cache.get(targetChannelId) as TextChannel;

    if (!targetChannel) {
        await interaction.reply({
            content: 'The target channel does not exist',
            ephemeral: true,
        });
        return;
    }

    const questionMessage = await targetChannel.send(`*Anonymous Question:* \n${question}`);
    const thread = await questionMessage.startThread({
        name: `Question: from ${interaction.user.username}`,
        autoArchiveDuration: 1440, // 24 hours
    });

    await interaction.reply({
        content: `Your question has been sent to ${targetChannel.toString()}`,
        ephemeral: true,
    });

    const adminRoleId = 'ROLE_ID';
    await thread.send(`<@&${adminRoleId}> A new question has been posted.`);
}

const questionCommand: Command = {
    data: metadata.toJSON(),
    opt: {
        cooldown: 5,
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Utility',
    },
    execute,
};

export default questionCommand;
