function getEligibleRoleId(roleMappings, level) {
    const eligibleRoles = Object.entries(roleMappings || {})
        .filter(([_, data]) => data.discord_role_id && data.level_requirement != null && level >= data.level_requirement) // only roles user meets reqs for
        .sort((a, b) => b[1].level_requirement - a[1].level_requirement); // sorts roles in order of greatest req

    if(eligibleRoles.length === 0) return null;

    return {
        rank: eligibleRoles[0][0],
        discord_role_id: eligibleRoles[0][1].discord_role_id
    };
}

async function removeMappedRoles(memberDiscord, roleMappings) {
    for(const rankObj of Object.values(roleMappings)) {
        const rid = rankObj.discord_role_id;
        if(rid && memberDiscord.roles.cache.has(rid)) await memberDiscord.roles.remove(rid);
    }
}

module.exports = { getEligibleRoleId, removeMappedRoles };