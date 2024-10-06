import type { ButtonInteraction } from 'discord.js';

import type { IButton } from '../interfaces/IButton.js';

import type { ExtendedClient } from './client.js';

export class Button implements IButton {
    client: ExtendedClient;
    id: string;

    constructor(client: ExtendedClient, id: string) {
        this.client = client;
        this.id = id;
    }

    async execute(interaction: ButtonInteraction): Promise<void> {
        throw new Error(`Method not implemented in ${interaction.id} button.`);
    }
}
