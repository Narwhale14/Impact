async function getGuildByName(guildName) {
    try {
        const response = await fetch(`https://api.hypixel.net/guild?name=${encodeURIComponent(guildName)}&key=${process.env.HYPIXEL_API_KEY}`);
        const data = await response.json();

        // verify connection to api
        if (!data.success || !data.guild)
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
        if (!data.success || !data.guild)
            throw new Error(data.cause || 'Unknown Hypixel API error');

        return data.guild;
    } catch(err) {
        console.log("Error fetching guild data: ", err);
        throw err;
    }
}

module.exports = { getGuildByName, getGuildById };