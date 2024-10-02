import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { type PathLike, readdirSync } from 'node:fs';
import {
    REST,
    type RESTPostAPIApplicationCommandsJSONBody,
    type RESTPostAPIApplicationGuildCommandsJSONBody,
    type RESTPutAPIApplicationCommandsJSONBody,
    type RESTPutAPIApplicationGuildCommandsJSONBody,
    Routes,
} from 'discord.js';
import { env } from './env.js';
import type { Command } from './interfaces/command.js';
import { logger } from './utils/logger.js';

const commands:
    | RESTPostAPIApplicationCommandsJSONBody[]
    | RESTPostAPIApplicationGuildCommandsJSONBody[] = [];
const commandFolderPath = fileURLToPath(new URL('commands', import.meta.url));
async function loadCommands(commandFolderPath: PathLike) {
    const commandFiles = readdirSync(commandFolderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = join(commandFolderPath.toString(), file);
        const command: Command = (await import(filePath)).default;
        commands.push(command.data);
    }
}
await loadCommands(commandFolderPath);
const rest = new REST().setToken(env.DISCORD_TOKEN);

(async () => {
    try {
        logger.info('Started refreshing application (/) commands.');

        if (env.GUILD_ID) {
            (await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID), {
                body: commands,
            })) as RESTPutAPIApplicationGuildCommandsJSONBody[];
            logger.info(
                `Successfully reloaded ${commands.length} application (/) commands for guild ${env.GUILD_ID}`
            );
        } else {
            (await rest.put(Routes.applicationCommands(env.CLIENT_ID), {
                body: commands,
            })) as RESTPutAPIApplicationCommandsJSONBody[];
            logger.info(
                `Successfully reloaded ${commands.length} application (/) commands globally`
            );
        }
    } catch (error) {
        logger.error(error);
    }
})();
