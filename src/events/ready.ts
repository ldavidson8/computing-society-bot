import { Events } from 'discord.js';
import { Event } from '../classes/event.js';
import { logger } from '../utils/logger.js';
import type { ExtendedClient } from '../classes/client.js';

export default class ReadyEvent extends Event {
    constructor(client: ExtendedClient) {
        super(client, {
            name: Events.ClientReady,
            description: 'Event that is triggered when the bot is ready',
            once: true,
        });
    }

    override async execute() {
        if (!this.client.user) {
            logger.error('Client user is not available');
            return;
        }
        logger.info('⌛ Starting...');
        logger.info(`Setting presence...`);
        this.client.user?.setPresence({
            status: 'online',
        });
        logger.info(`🟢 Logged in as ${this.client.user?.tag} (${this.client.user?.id})`);
        logger.info(`🟢 Ready on ${this.client.guilds.cache.size} servers`);
    }
}
