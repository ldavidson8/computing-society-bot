import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    PermissionsBitField,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import type { ExtendedClient } from '../../classes/client.js';
import Command from '../../classes/command.js';
import { Category } from '../../enums/Category.js';

const COURSES = [
    'Software Engineering',
    'Computer Science',
    'Cyber Security',
    'Games Development',
    'Networking',
    'Computing',
    'Masters',
    'BAE',
    'Engineering',
    'Electronics Engineering',
    'Robotics Engineering',
    'Other',
    'PhD',
] as const;

export default class CourseCommand extends Command {
    constructor(client: ExtendedClient) {
        super(client, {
            name: 'course',
            description: 'Select your course',
            category: Category.RoleManagement,
            options: [],
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permission: false,
            cooldown: 5,
        });
    }

    override async execute(interaction: ChatInputCommandInteraction) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_course')
            .setPlaceholder('Select your course')
            .addOptions(
                COURSES.map(course =>
                    new StringSelectMenuOptionBuilder().setLabel(course).setValue(course)
                )
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        await interaction.reply({
            content: 'Select your course',
            components: [row],
        });
    }
}
