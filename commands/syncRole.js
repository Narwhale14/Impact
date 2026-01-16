const { SlashCommandBuilder } = require('discord.js');
const { updateGuildData, getGuildData } = require('../utils/dbManager');
const { getGuildById } = require('../utils/hypixelAPIManager.js');

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
            // fetch db data on guild
            const guildData = await getGuildData(interaction.guild.id);

            // if no synced guild, return
            if(!guildData?.hypixel_guild_id)
                return interaction.editReply({ content: "This server isn't synced to a Hypixel guild yet!\nPlease run: /syncGuild <guild name>"});

            const hypixelRole = interaction.options.getString('hypixel_role').trim().toUpperCase();
            const discordRole = interaction.options.getRole('server_role');

            // check if user inputted hypixel role actually exists in guild
            const hypixelGuild = await getGuildById(guildData.hypixel_guild_id);
            const hypixelGuildRoles = Object.values(hypixelGuild.roles || []);
            if(!hypixelGuild.ranks.find(r => r.tag?.trim().toUpperCase() === hypixelRole))
                return interaction.editReply(`The guild role **${hypixelRole}** does not exist in Hypixel guild **${hypixelGuild.name}**`);

            // add new role
            const roleMappings = guildData?.role_mappings || {};
            roleMappings[hypixelRole] = { discord_role_id: discordRole.id }
            await updateGuildData(interaction.guild, { roleMappings });

            await interaction.editReply({ content: `Linked **${hypixelRole}** to role <@&${discordRole.id}> successfully!`, allowedMentions: { roles: [] } });
        } catch(err) {
            console.error("Failed to pull/update guild data: ", err);
            await interaction.editReply({ content: "An error occurred while syncing roles." });
        }
    }
}