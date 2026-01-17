function getEligibleRoleId(roleMappings, level) {
    const eligibleRoles = Object.values(roleMappings || {})
        .filter(r => r.discord_role_id && r.level_requirement != null && level >= r.level_requirement) // only roles user meets reqs for
        .sort((a, b) => b.level_requirement - a.level_requirement); // sorts roles in order of greatest req

    return eligibleRoles[0]?.discord_role_id ?? null;
}

async function removeMappedRoles(memberDiscord, roleMappings) {
    for(const rankObj of Object.values(roleMappings)) {
        const rid = rankObj.discord_role_id;
        if(rid && memberDiscord.roles.cache.has(rid)) await memberDiscord.roles.remove(rid);
    }
}

module.exports = { getEligibleRoleId, removeMappedRoles };