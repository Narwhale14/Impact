const { SlashCommandBuilder } = require('discord.js');
const { updateGuildData, getGuildData } = require('../utils/dbManager');
const { getGuildById } = require('../utils/hypixelAPIManager.js');

/**
 * @command - /linkrole
 * links an in-game rank in the hypixel guild to a role in the discord
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('linkrole')
        .setDescription('Links in-game guild rank with discord role')
        .addStringOption(option => option.setName('hypixel_rank').setDescription('Guild rank').setRequired(true))
        .addRoleOption(option => option.setName('server_role').setDescription('Server role').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.hypixel_guild_id)
                return interaction.editReply({ content: "This server isn't linked to a Hypixel guild yet!\nPlease run: /linkGuild <guild name>"});

            const hypixelRank = interaction.options.getString('hypixel_rank').trim().toUpperCase();
            const discordRole = interaction.options.getRole('server_role');

            // api call
            const hypixelGuild = await getGuildById(guildDBData.hypixel_guild_id);
            if(!hypixelGuild.ranks.find(r => r.tag?.trim().toUpperCase() === hypixelRank))
                return interaction.editReply({ content: `The guild rank **${hypixelRank}** does not exist in Hypixel guild **${hypixelGuild.name}**`} );

            const roleMappings = guildDBData?.role_mappings || {};

            if(roleMappings[hypixelRank])
                return interaction.editReply({ content: `The guild rank** ${hypixelRank}** is already linked to <@&${roleMappings[hypixelRank].discord_role_id}>!`, allowedMentions: { roles: [] } });
            roleMappings[hypixelRank] = { discord_role_id: discordRole.id }
            await updateGuildData(interaction.guild, { roleMappings });

            await interaction.editReply({ content: `Linked **${hypixelRank}** to <@&${discordRole.id}> successfully!`, allowedMentions: { roles: [] } });
        } catch(err) {
            console.error("Failed to pull/update guild data: ", err);
            await interaction.editReply({ content: "An error occurred while linking roles." });
        }
    }
}