async function getUUIDFromName(username) {
    try {
        const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        if(!response.ok) throw new Error(`Minecraft username "${username} not found!`);

        const data = await response.json();
        return data.id; // uuid
    } catch(err) {
        console.error("Error fetching UUID: ", err);
        throw err;
    }
}

module.exports = { getUUIDFromName }