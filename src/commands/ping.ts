import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../interfaces/command.js';
import { RateLimiter } from 'discord.js-rate-limiter';

export const metadata = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

const rateLimiter = new RateLimiter(1, 5000);

async function execute(interaction: CommandInteraction): Promise<void> {
    const limited = rateLimiter.take(interaction.user.id);
    if (limited) {
        await interaction.reply({
            content: 'You are being rate limited!',
            ephemeral: true,
        });
        return;
    }
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    await interaction.editReply(
        `🏓 Pong! Latency is ${sent.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(
            interaction.client.ws.ping
        )}ms`
    );
}

const pingCommand: Command = {
    data: metadata.toJSON(),
    opt: {
        cooldown: 5,
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Utility',
    },
    execute,
};

export default pingCommand;
