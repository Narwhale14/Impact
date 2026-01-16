const { SlashCommandBuilder } = require('discord.js');
const { updateGuildData, getGuildData } = require('../utils/dbManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('syncrole')
        .setDescription('Syncs in game guild role with discord role')
        .addStringOption(option => option.setName('hypixel_role').setDescription('Guild role').setRequired(true))
        .addRoleOption(option => option.setName('server_role').setDescription('Server role').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            // fetch db data on guild - role mappings
            const guildData = await getGuildData(interaction.guild.id);

            // if no synced guild, return
            if(!guildData?.hypixel_guild_id)
                return interaction.editReply({ content: "This server isn't synced to a Hypixel guild yet!\nPlease run: /syncGuild <guild name>"});

            const hypixelRole = interaction.options.getString('hypixel_role').toUpperCase();
            const discordRole = interaction.options.getRole('server_role');

            // if hypixel role is not in mappings
            const roleMappings = guildData?.role_mappings || {};
            if(!roleMappings[hypixelRole])
                return interaction.editReply({ content: `The guild role **${hypixelRole}** is currently not mapped.`})

            // add new role to json, then overwrite in db
            roleMappings[hypixelRole] = { discord_role_id: discordRole.id }
            await updateGuildData(interaction.guild, { roleMappings });

            await interaction.editReply({ content: `Linked **${hypixelRole}** to role: ${discordRole.name} successfully` })
        } catch(err) {
            console.error("Failed to pull/update guild data: ", err);
            throw err;
        }
    }
}