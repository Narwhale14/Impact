const { db } = require('../database.js');

async function updateGuildData(guild, { verificationRoleId, adminRoleId }) {
    await db.query(
        `
        INSERT INTO guild_data (guild_id, verification_role, admin_role, guild_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (guild_id)
        DO UPDATE SET
            verification_role = COALESCE($2, guild_data.verification_role),
            admin_role = COALESCE($3, guild_data.admin_role),
            guild_name = COALESCE($4, guild_data.guild_name)
        `,
        [guild.id, verificationRoleId || null, adminRoleId || null, guild.name]
    );
}

async function getGuildData(guildId) {
    const res = await db.query(
        `SELECT * FROM guild_data WHERE guild_id = $1`,
        [guildId]
    );
    return res.rows[0] || null;
}

module.exports = { updateGuildData, getGuildData };