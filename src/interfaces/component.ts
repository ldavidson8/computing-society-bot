import { PermissionsBitField, type MessageComponentInteraction } from 'discord.js';

export interface ComponentOptions<TInteraction extends MessageComponentInteraction> {
    customId: string;
    permissions?: bigint[];
    execute(interaction: TInteraction): Promise<void>;
}

export class Component<TInteraction extends MessageComponentInteraction> {
    public readonly customId: string;
    public readonly permissions: bigint[];
    public execute: (interaction: TInteraction) => Promise<void>;
    public constructor({
        customId,
        permissions = [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ViewChannel,
        ],
        execute,
    }: ComponentOptions<TInteraction>) {
        this.customId = customId;
        this.permissions = permissions;
        this.execute = execute;
    }
}
