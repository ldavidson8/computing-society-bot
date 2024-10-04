import { Events, type Interaction } from 'discord.js';
import type { Event } from '../interfaces/event.js';
import type { ExtendedClient } from '../classes/client.js';
import { logger } from '../utils/logger.js';

const event: Event = {
    name: Events.InteractionCreate,
    execute: async (client: ExtendedClient, interaction: Interaction) => {
        if (!interaction.isCommand()) return;

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error.stack);
                } else {
                    logger.error(error);
                }
            }
        } else if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);

            if (!button) return;
            try {
                await button.execute(interaction);
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error.stack);
                } else {
                    logger.error(error);
                }
            }
        } else if (interaction.isStringSelectMenu()) {
            const selectMenu = client.selectMenus.get(interaction.customId);

            if (!selectMenu) return;
            try {
                await selectMenu.execute(interaction);
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error.stack);
                } else {
                    logger.error(error);
                }
            }
        }
    },
};

export default event;
