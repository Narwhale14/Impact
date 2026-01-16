const { db } = require('../database.js');

async function updateGuildData(guild, { verificationRoleId, adminRoleId, roleMappings, hypixelGuildId }) {
    await db.query(
        `
        INSERT INTO guild_data (discord_server_id, discord_server_name, verification_role, admin_role, role_mappings, hypixel_guild_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (discord_server_id)
        DO UPDATE SET
            verification_role = COALESCE($2, guild_data.verification_role),
            admin_role = COALESCE($3, guild_data.admin_role),
            discord_server_name = COALESCE($4, guild_data.discord_server_name),
            role_mappings = COALESCE($5, guild_data.role_mappings),
            hypixel_guild_id = COALESCE($6, guild_data.hypixel_guild_id)
        `,
        [
            guild.id, 
            guild.name,
            verificationRoleId || null, 
            adminRoleId || null, 
            roleMappings ? JSON.stringify(roleMappings) : null,
            hypixelGuildId || null
        ]
    );
}

async function getGuildData(guildId) {
    const res = await db.query(
        `SELECT * FROM guild_data WHERE discord_server_id = $1`,
        [guildId]
    );
    return res.rows[0] || null;
}

module.exports = { updateGuildData, getGuildData };