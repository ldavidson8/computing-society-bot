import {
    TextChannel,
    CommandInteractionOptionResolver,
    ChatInputCommandInteraction,
    ApplicationCommandOptionType,
    PermissionsBitField,
} from 'discord.js';
import Command from '../../classes/command.js';
import { Category } from '../../enums/Category.js';
import type { ExtendedClient } from '../../classes/client.js';

export default class Question extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            name: 'question',
            description: 'Ask a question to the admins',
            category: Category.Utility,
            options: [
                {
                    name: 'question',
                    description: 'The question you want to ask',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permission: false,
            cooldown: 5,
        });
    }

    override async execute(interaction: ChatInputCommandInteraction): Promise<void> {
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
}
