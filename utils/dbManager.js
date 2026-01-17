const { pool } = require('../database.js');

/**
 * Helper function that updates guild data, accepting 1 or more of the table contents
 * @param {*} guild guild object (interaction.guild)
 * @param {*} param1 table contents
 */
async function updateGuildData(guild, { verificationRoleId, adminRoleId, roleMappings, hypixelGuildId }) {
    try {
        await pool.query(
            `INSERT INTO guild_data (discord_server_id, discord_server_name, verification_role, admin_role, role_mappings, hypixel_guild_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (discord_server_id)
            DO UPDATE SET
                discord_server_name = COALESCE($2, guild_data.discord_server_name),
                verification_role = COALESCE($3, guild_data.verification_role),
                admin_role = COALESCE($4, guild_data.admin_role),
                role_mappings = COALESCE($5, guild_data.role_mappings),
                hypixel_guild_id = COALESCE($6, guild_data.hypixel_guild_id)`,
            [
                guild.id, 
                guild.name,
                verificationRoleId || null, 
                adminRoleId || null, 
                roleMappings ? JSON.stringify(roleMappings) : null,
                hypixelGuildId || null
            ]
        );
    } catch(err) {
        console.error('DB error in updateGuildData: ', err);
        throw err;
    }
}

/**
 * Gets a piece of data from the guild_data table
 * @param {*} guildId interaction.guild.id
 * @returns the data
 */
async function getGuildData(guildId) {
    try {
        const res = await pool.query(
            `SELECT * FROM guild_data WHERE discord_server_id = $1`,
            [guildId]
        );
        return res.rows[0] || null;
    } catch(err) {
        console.error('DB error in getGuildData: ', err);
        throw err;
    }
}

/**
 * nullifies guild data by column
 * @param {*} guild guild id or object (interaction.guild.id)
 * @param {*} columnName name of column in table (see neon db or updateGuildData)
 * @param {*} value value to set (pass null to erase)
 */
async function updateGuildColumn(guild, columnName, value) {
    try {
        // lets function accept either discord guild obj or id
        const guildId = typeof guild === 'string' ? guild : guild?.id;
        const guildName = typeof guild === 'object' ? guild.name : null;

        if(!guildId) throw new Error('nullifyGuildColumn called without valid guildId');

        const guildRes = await pool.query(
            `SELECT 1 FROM guild_data WHERE discord_server_id = $1`,
            [guildId]
        );

        // creates guild_data entry if didn't exist
        if(guildRes.rowCount === 0) {
            await pool.query(
                `INSERT INTO guild_data (discord_server_id, discord_server_name, ${columnName})
                VALUES ($1, $2, $3)`,
                [guildId, guildName, value]
            );
        } else {
            await pool.query(
                `UPDATE guild_data SET ${columnName} = $1 WHERE discord_server_id = $2`,
                [value, guildId]
            )
        }
    } catch(err) {
        console.error('Error nullifying guild column', err);
        throw err;
    }
}

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

module.exports = { updateGuildData, getGuildData, updateGuildColumn, updateLinkedPlayers, deleteLinkedPlayer, getLinkedPlayer };