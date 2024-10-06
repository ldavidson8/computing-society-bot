import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
    Collection,
    REST,
    type RESTPutAPIApplicationCommandsJSONBody,
    type RESTPutAPIApplicationGuildCommandsJSONBody,
    Routes,
} from 'discord.js';
import { env } from './env.js';
import { logger } from './utils/logger.js';
import type Command from './classes/command.js';
import FastGlob from 'fast-glob';
import { ExtendedClient } from './classes/client.js';

function getJson(commandsCollection: Collection<string, Command>) {
    return commandsCollection.map(command => ({
        name: command.name,
        description: command.description,
        options: command.options,
        default_member_permissions: command.default_member_permissions.toString(),
        dm_permission: command.dm_permission,
    }));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadCommands(): Promise<Collection<string, Command>> {
    const commandsCollection = new Collection<string, Command>();
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = await FastGlob('**/*.js', { cwd: commandsPath });

    logger.info(`Looking for commands in: ${commandsPath}`);
    logger.info(`Found command files: ${commandFiles.join(', ')}`);

    for (const file of commandFiles) {
        try {
            const filePath = join(commandsPath, file);
            const { default: CommandClass } = await import(filePath);
            const command: Command = new CommandClass(ExtendedClient);

            if ('name' in command && 'execute' in command) {
                commandsCollection.set(command.name, command);
                logger.info(`Loaded command: ${command.name}`);
            } else {
                logger.warn(
                    `The command at ${file} is missing a required "name" or "execute" property.`
                );
            }
        } catch (error) {
            logger.error(`Error loading command from file ${file}:`, error);
        }
    }

    return commandsCollection;
}

const commandsCollection = await loadCommands();
const commandsJson = getJson(commandsCollection);
const rest = new REST().setToken(env.DISCORD_TOKEN);

(async () => {
    try {
        logger.info(`Started refreshing ${commandsCollection.size} application (/) commands.`);

        if (env.GUILD_ID) {
            const result = (await rest.put(
                Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID),
                {
                    body: commandsJson,
                }
            )) as RESTPutAPIApplicationGuildCommandsJSONBody[];
            logger.info(
                `Successfully reloaded ${result.length} application (/) commands for guild ${env.GUILD_ID}`
            );
        } else {
            const result = (await rest.put(Routes.applicationCommands(env.CLIENT_ID), {
                body: commandsJson,
            })) as RESTPutAPIApplicationCommandsJSONBody[];
            logger.info(`Successfully reloaded ${result.length} application (/) commands globally`);
        }
    } catch (error) {
        logger.error(error);
    }
})();
