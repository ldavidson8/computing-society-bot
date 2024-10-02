import {
    ButtonInteraction,
    StringSelectMenuInteraction,
    GuildMember,
    ActionRowBuilder,
    GuildMemberRoleManager,
    StringSelectMenuBuilder,
} from 'discord.js';

const pronounRoles = ['He/Him', 'She/Her', 'They/Them', 'Any/All', 'Pronouns: Ask Me'];

export async function handleMultiplePronouns(i: ButtonInteraction) {
    if (!i.guild) {
        await i.reply({ content: 'Guild not found', ephemeral: true });
        return;
    }

    const userId = i.user.id;

    // Fetch all roles
    await i.guild.roles.fetch();

    const options = pronounRoles.map(role => ({
        label: role,
        value: role,
    }));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`pronoun_select_${userId}`)
            .setPlaceholder('Select your pronouns')
            .setMinValues(1)
            .setMaxValues(pronounRoles.length)
            .addOptions(options)
    );

    await i.reply({
        content: 'Select your pronouns:',
        components: [row],
        ephemeral: true,
    });
}

export async function handleSinglePronoun(i: ButtonInteraction) {
    let roleName = i.customId;
    if (roleName === 'Pronouns: Ask Me') {
        roleName = 'Pronouns: Ask Me';
    }
    if (!i.guild) {
        await i.reply({ content: 'Guild not found', ephemeral: true });
        return;
    }

    await i.guild.roles.fetch();

    const selectedRole = i.guild.roles.cache.find(r => r.name === roleName);

    if (!selectedRole) {
        await i.reply({ content: `Role "${roleName}" not found`, ephemeral: true });
        return;
    }

    if (i.member && i.member.roles instanceof GuildMemberRoleManager) {
        // Remove all pronoun roles
        for (const pronounRoleName of pronounRoles) {
            const roleToRemove = i.guild.roles.cache.find(r => r.name === pronounRoleName);
            if (roleToRemove && i.member.roles.cache.has(roleToRemove.id)) {
                await i.member.roles.remove(roleToRemove);
            }
        }

        // Add the selected role
        await i.member.roles.add(selectedRole);

        await i.reply({
            content: `Your preferred pronoun has been updated to ${roleName}`,
            ephemeral: true,
        });
    } else {
        await i.reply({ content: 'Failed to update pronoun', ephemeral: true });
    }
}

export async function handlePronounSelection(selectInteraction: StringSelectMenuInteraction) {
    const selectedRoles = selectInteraction.values;
    const member = selectInteraction.member as GuildMember;

    if (!selectInteraction.guild) {
        await selectInteraction.reply({ content: 'Guild not found', ephemeral: true });
        return;
    }

    for (const roleName of pronounRoles) {
        const role = selectInteraction.guild?.roles.cache.find(r => r.name === roleName);
        if (role) {
            if (selectedRoles.includes(roleName)) {
                if (!member.roles.cache.has(role.id)) {
                    await member.roles.add(role);
                }
            } else {
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                }
            }
        }
    }

    await selectInteraction.update({
        content: 'Roles updated! You can select again to modify your choices.',
        components: selectInteraction.message.components,
    });
}
