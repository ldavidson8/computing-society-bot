import type { Category } from '../enums/Category.js';

import type { ICommandOption } from './ICommandOption.js';

export interface ICommandOptions {
    name: string;
    description: string;
    category: Category;
    options: ICommandOption[];
    default_member_permissions: bigint;
    dm_permission: boolean;
    cooldown?: number;
}
