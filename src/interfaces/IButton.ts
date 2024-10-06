import type { ButtonInteraction } from 'discord.js';

import type { ExtendedClient } from '../classes/client.js';

export interface IButton {
    client: ExtendedClient;
    id: string;

    execute(interaction: ButtonInteraction): Promise<void>;
}
