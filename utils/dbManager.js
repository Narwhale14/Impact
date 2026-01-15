const { db } = require('../database.js');

async function updateGuildData(guildId, { verificationRoleId, adminRoleId }) {
    await db.query(
        `
        INSERT INTO guild_data (guild_id, verification_role, admin_role)
        VALUES ($1, $2, $3)
        ON CONFLICT (guild_id)
        DO UPDATE SET
            verification_role = COALESCE($2, guild_data.verification_role),
            admin_role = COALESCE($3, guild_data.admin_role)
        `,
        [guildId, verificationRoleId || null, adminRoleId || null]
    );
}

module.exports = { updateGuildData };