import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    CLIENT_ID: z.string().min(1, { message: 'CLIENT_ID is required' }),
    GUILD_ID: z.string().optional(),
    DISCORD_TOKEN: z.string().min(1, { message: 'DISCORD_TOKEN is required' }),
});

export const env = envSchema.parse(process.env);
