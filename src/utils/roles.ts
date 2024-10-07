import { Guild, Role, type ColorResolvable } from 'discord.js';

export async function checkRoleExists(guild: Guild, roleName: string): Promise<Role> {
    const role = guild.roles.cache.find(r => r.name === roleName);
    return role;
}

export async function createRoleIfNotExists(
    guild: Guild,
    roleName: string,
    reason: string,
    color?: ColorResolvable
) {
    const roleExists = await checkRoleExists(guild, roleName);
    if (!roleExists) {
        const role = await guild.roles.create({
            name: roleName,
            reason: reason,
            color: color || 'Random',
        });
        return role;
    } else {
        return guild.roles.cache.find(r => r.name === roleName);
    }
}

export async function removeExistingRoles(guild: Guild, userId: string, roles: string[]) {
    const member = await guild.members.fetch(userId);
    for (const existingRole of member.roles.cache.values()) {
        if (roles.includes(existingRole.name)) {
            await member.roles.remove(existingRole);
        }
    }
}
