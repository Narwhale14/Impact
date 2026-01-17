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

async function getGuildByPlayerUUID(playerUUID) {
    try {
        const response = await fetch(`https://api.hypixel.net/guild?player=${encodeURIComponent(playerUUID)}&key=${process.env.HYPIXEL_API_KEY}`);
        const data = await response.json();

        // verify connection to api
        if(!data.success || !data.guild)
            throw new Error(data.cause || 'Unknown Hypixel API error');

        return data.guild;
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


module.exports = { getGuildByName, getGuildById, getPlayerByName, getGuildByPlayerUUID };