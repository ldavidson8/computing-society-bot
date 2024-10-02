import { ExtendedClient } from '../classes/client.js';
import type { ClientEvents } from 'discord.js';

export interface Event {
    name: keyof ClientEvents;
    once?: boolean;
    execute(client: ExtendedClient, ...args: unknown[]): void;
}
