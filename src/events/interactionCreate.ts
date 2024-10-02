import { Events, type Interaction } from 'discord.js';
import type { Event } from '../interfaces/event.js';
import type { ExtendedClient } from '../classes/client.js';
import { logger } from '../utils/logger.js';

const event: Event = {
    name: Events.InteractionCreate,
    execute: async (client: ExtendedClient, interaction: Interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`No command matching ${interaction.commandName} found`);
            return;
        }

        try {
            if (interaction.isChatInputCommand()) {
                await command.execute(interaction);
            }
        } catch (error) {
            logger.error(`Error executing command ${interaction.commandName}:`, error);

            if (interaction.deferred || interaction.replied) {
                interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                });
            } else {
                interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                });
            }
        }
    },
};

export default event;
