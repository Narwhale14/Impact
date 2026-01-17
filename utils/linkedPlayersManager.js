const { pool } = require('../database.js');

async function updateLinkedPlayers({ discordId, hypixelUUID, hypixelName, guildDataId }) {
    try {
        await pool.query(
            `INSERT INTO linked_players (discord_id, hypixel_uuid, hypixel_name, guild_data_id, linked_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (discord_id)
            DO UPDATE SET
                hypixel_uuid = EXCLUDED.hypixel_uuid,
                hypixel_name = EXCLUDED.hypixel_name,
                guild_data_id = EXCLUDED.guild_data_id,
                linked_at = NOW()`,
            [discordId, hypixelUUID, hypixelName, guildDataId]
        );
    } catch(err) {
        console.error(`DB error in updateLinkedPlayers: `, err);
        throw err;
    }
}

async function deleteLinkedPlayer(discordId) {
    try {
        await pool.query(
            `DELETE FROM linked_players WHERE discord_id = $1`, 
            [discordId]
        );
    } catch(err) {
        console.error(`DB error in deleteLinkedPlayer: attempted to delete discordId=${discordId}: `, err);
        throw err;
    }
}

async function getLinkedPlayer(discordId) {
    try {
        const res = await pool.query(
            `SELECT * FROM linked_players WHERE discord_id = $1`,
            [discordId]
        );

        return res.rows[0] || null;
    } catch(err) {
        console.error(`DB error in getLinkedPlayer: attempted to fetch discordId=${discordId}: `, err);
        throw err;
    }
}

module.exports = { updateLinkedPlayers, deleteLinkedPlayer, getLinkedPlayer };