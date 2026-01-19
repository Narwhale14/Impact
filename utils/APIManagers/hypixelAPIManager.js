async function getGuildByName(guildName) {
    try {
        const response = await fetch(`https://api.hypixel.net/guild?name=${encodeURIComponent(guildName)}&key=${process.env.HYPIXEL_API_KEY}`);
        const data = await response.json();

        // verify connection to api
        if(!data.success || !data.guild)
            throw new Error(data.cause || 'Unknown Hypixel API error');

        return data.guild;
    } catch(err) {
        console.log("Error fetching guild data: ", err);
        throw err;
    }
}

async function getGuildById(guildId) {
    try {
        const response = await fetch(`https://api.hypixel.net/guild?id=${guildId}&key=${process.env.HYPIXEL_API_KEY}`);
        const data = await response.json();

        // verify connection to api
        if(!data.success || !data.guild)
            throw new Error(data.cause || 'Unknown Hypixel API error');

        return data.guild;
    } catch(err) {
        console.log("Error fetching guild data: ", err);
        throw err;
    }
}

async function getMemberInGuildByPlayerUUID(playerUUID) {
    try {
        const response = await fetch(`https://api.hypixel.net/guild?player=${encodeURIComponent(playerUUID)}&key=${process.env.HYPIXEL_API_KEY}`);
        const data = await response.json();

        // verify connection to api
        if(!data.success || !data.guild)
            throw new Error(data.cause || 'Unknown Hypixel API error');

        const memberData = data.guild.members.find(m => m.uuid === playerUUID);
        if(!memberData) return null;

        return { ...memberData, guild_id: data.guild._id, guild_name: data.guild.name };
    } catch(err) {
        console.log("Error fetching player data: ", err);
        throw err;
    }
}

async function getPlayerByName(playerName) {
    try {
        const response = await fetch(`https://api.hypixel.net/player?name=${encodeURIComponent(playerName)}&key=${process.env.HYPIXEL_API_KEY}`);
        const data = await response.json();

        // verify connection to api
        if(!data.success || !data.player)
            throw new Error(data.cause || 'Unknown Hypixel API error');

        return data.player;
    } catch(err) {
        console.log("Error fetching player data: ", err);
        throw err;
    }
}

async function getProfileSkyblockLevelByUUID(playerUUID, profileName) {
    try {
        const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${playerUUID}&key=${process.env.HYPIXEL_API_KEY}`);
        const data = await response.json();

        // verify connection to api
        if(!data.success || !Array.isArray(data.profiles))
            throw new Error(data.cause || 'Unknown Hypixel API error');

        const targetProfile = profileName?.toLowerCase();
        const filteredProfiles = data.profiles.filter(p => p.cute_name?.toLowerCase() === targetProfile);
        if(filteredProfiles.length === 0)
            throw new Error(targetProfile ? `Profile "${profileName}" not found!` : `No Skyblock profiles found`);

        const member = filteredProfiles[0].members[playerUUID];

        return {
            level: (member.leveling?.experience / 100) ?? 0,
            profile: filteredProfiles[0].cute_name
        };
    } catch(err) {
        console.log("Error fetching player data: ", err);
        throw err;
    }
}

module.exports = { 
    getGuildByName, 
    getGuildById, 
    getPlayerByName, 
    getMemberInGuildByPlayerUUID, 
    getProfileSkyblockLevelByUUID
};