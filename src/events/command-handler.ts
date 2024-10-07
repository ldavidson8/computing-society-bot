import { type ChatInputCommandInteraction, Collection, Events } from 'discord.js';

import type { ExtendedClient } from '../classes/client.js';
import { Event } from '../classes/event.js';
import { logger } from '../utils/logger.js';
import type Command from '../classes/command.js';

export default class CommandHandlerEvent extends Event {
    constructor(client: ExtendedClient) {
        super(client, {
            name: Events.InteractionCreate,
            description: 'Event that is triggered when a message is created',
            once: false,
        });
    }

    override async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const command: Command | undefined = this.client.commands.get(interaction.commandName);
        if (!command) {
            await interaction.reply({
                content: 'Command not found',
                ephemeral: true,
            });
            this.client.commands.delete(interaction.commandName);
            return;
        }

        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown ?? 3) * 1000;

        if (
            timestamps?.has(interaction.user.id) &&
            now < (timestamps.get(interaction.user.id) ?? 0) + cooldownAmount
        ) {
            await interaction.reply({
                content: `Please wait ${Math.round(((timestamps.get(interaction.user.id) ?? 0) + cooldownAmount - now) / 1000)} more second(s) before reusing the \`${command.name}\` command.`,
                ephemeral: true,
            });
            return;
        }

        timestamps?.set(interaction.user.id, now);

        setTimeout(() => {
            timestamps?.delete(interaction.user.id);
        }, cooldownAmount);

        try {
            const subCommandGroup = interaction.options.getSubcommandGroup(false);
            let subCommand = `${interaction.commandName}`;
            if (subCommandGroup) subCommand += `.${subCommandGroup}`;
            subCommand += `.${interaction.options.getSubcommand(false)}`;

            const { subCommands } = this.client;
            if (subCommands.has(subCommand)) {
                subCommands.get(subCommand)?.execute(interaction);
            } else {
                command.execute(interaction);
            }
        } catch (error) {
            logger.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    }
}
