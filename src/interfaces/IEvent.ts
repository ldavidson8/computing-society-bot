import { ExtendedClient } from '../classes/client.js';
import type { Events } from 'discord.js';

export interface IEvent {
    client: ExtendedClient;
    name: Events;
    description: string;
    once: boolean;
}
