const { pool } = require('../../database.js');

/**
 * Helper function that updates ALL guild data, accepting 1 or more of the table contents
 * @param {*} guild guild object (interaction.guild)
 * @param {*} param1 table contents
 */
async function updateGuildData(guild, { verificationRoleId, roleMappings, hypixelGuildId, applicationChannelId, requestsEnabled, requestsChannel }) {
    try {
        await pool.query(
            `INSERT INTO guild_data (
                discord_server_id, 
                discord_server_name, 
                verification_role, 
                role_mappings, 
                hypixel_guild_id, 
                application_channel_id, 
                requests_enabled, 
                requests_channel)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (discord_server_id)
            DO UPDATE SET
                discord_server_name = COALESCE($2, guild_data.discord_server_name),
                verification_role = COALESCE($3, guild_data.verification_role),
                role_mappings = COALESCE($4, guild_data.role_mappings),
                hypixel_guild_id = COALESCE($5, guild_data.hypixel_guild_id),
                application_channel_id = COALESCE($6, guild_data.application_channel_id),
                requests_enabled = COALESCE($7, guild_data.requests_enabled),
                requests_channel = COALESCE($8, requests_channel)`,
            [
                guild.id, 
                guild.name,
                verificationRoleId || null, 
                roleMappings ? JSON.stringify(roleMappings) : null,
                hypixelGuildId || null,
                applicationChannelId || null,
                requestsEnabled || false,
                requestsChannel || null
            ]
        );
    } catch(err) {
        console.error('DB error in updateGuildData: ', err);
        throw err;
    }
}

/**
 * Gets a piece of data from the guild_data table. works as the same function above, updates only one column
 * can also create new entries
 * @param {*} guild interaction.guild
 * @returns the data
 */
async function getGuildData(guild) {
    try {
        const guildId = typeof guild === 'string' ? guild : guild?.id;
        const guildName = typeof guild === 'object' ? guild.name : null;

        const res = await pool.query(
            `SELECT * FROM guild_data WHERE discord_server_id = $1`,
            [guildId]
        );
        
        if(res.rowCount === 0) {
            await pool.query(
                `INSERT INTO guild_data (discord_server_id, discord_server_name)
                VALUES ($1, $2)
                ON CONFLICT (discord_server_id) DO NOTHING`,
                [guildId, guildName]
            );
        }

        return res.rows[0];
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
    const guildId = typeof guild === 'string' ? guild : guild?.id;
    const guildName = typeof guild === 'object' ? guild.name : null;
    let dbValue = value;

    const allowedColumns = [
        'verification_role',
        'role_mappings',
        'hypixel_guild_id',
        'application_channel_id',
        'requests_enabled',
        'logs_channel_id',
        'guild_member_role'
    ];

    const jsonColumns = ['role_mappings'];

    // handle JSON automatically for specific columns
    if(jsonColumns.includes(columnName) && value !== null && value !== undefined)
        dbValue = JSON.stringify(value);

    try {
        if(!allowedColumns.includes(columnName)) throw new Error('Invalid column name!');
        if(!guildId) throw new Error('nullifyGuildColumn called without valid guildId');

        const res = await pool.query(
            `SELECT 1 FROM guild_data WHERE discord_server_id = $1`,
            [guildId]
        );

        // creates guild_data entry if didn't exist
        if(res.rowCount === 0) {
            await pool.query(
                `INSERT INTO guild_data (discord_server_id, discord_server_name, ${columnName})
                VALUES ($1, $2, $3)
                ON CONFLICT (discord_server_id) DO NOTHING`,
                [guildId, guildName, dbValue]
            );
        } else {
            await pool.query(
                `UPDATE guild_data SET ${columnName} = $1 WHERE discord_server_id = $2`,
                [dbValue, guildId]
            )
        }
    } catch(err) {
        console.error('Error nullifying guild column', err);
        throw err;
    }
}

module.exports = { updateGuildData, getGuildData, updateGuildColumn };