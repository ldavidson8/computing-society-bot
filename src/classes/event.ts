import type { Events } from 'discord.js';
import type { IEvent } from '../interfaces/IEvent.js';
import type { IEventOptions } from '../interfaces/IEventOptions.js';
import type { ExtendedClient } from './client.js';

export class Event implements IEvent {
    client: ExtendedClient;

    name: Events;

    description: string;

    once: boolean;

    constructor(client: ExtendedClient, options: IEventOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.once = options.once;
    }

    async execute(...args: unknown[]): Promise<void> {
        throw new Error(`Execute not implemented. Args: ${JSON.stringify(args)}`);
    }
}
