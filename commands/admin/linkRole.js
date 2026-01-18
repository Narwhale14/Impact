const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildData, getGuildData } = require('../../utils/guildDataManager.js');
const { getGuildById } = require('../../utils/hypixelAPIManager.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /linkrole
 * links an in-game rank in the hypixel guild to a role in the discord
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('linkrole')
        .setDescription('Links in-game guild rank with discord role')
        .addStringOption(option => option.setName('hypixel_rank').setDescription('Guild rank').setRequired(true))
        .addRoleOption(option => option.setName('server_role').setDescription('Server role').setRequired(true))
        .addIntegerOption(option => option.setName('requirement').setDescription('Skyblock level requirement').setMinValue(0).setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.hypixel_guild_id) return interaction.editReply({ embeds: [embeds.guildNotLinked()] });

            const hypixelRank = interaction.options.getString('hypixel_rank').trim().toUpperCase();
            const discordRole = interaction.options.getRole('server_role');

            // api call
            const hypixelGuild = await getGuildById(guildDBData.hypixel_guild_id);
            if(!hypixelGuild.ranks.find(r => r.tag?.trim().toUpperCase() === hypixelRank))
                return interaction.editReply({ embeds: [embeds.errorEmbed(`The guild rank **${hypixelRank}** does not exist in Hypixel guild **${hypixelGuild.name}**`)] });

            const roleMappings = guildDBData?.role_mappings || {};
            if(roleMappings[hypixelRank])
                return interaction.editReply({ embeds: [embeds.errorEmbed(`The guild rank** ${hypixelRank}** is already linked to <@&${roleMappings[hypixelRank].discord_role_id}>!`)], allowedMentions: { roles: [] } });

            // set data
            const requirement = interaction.options.getInteger('requirement');
            roleMappings[hypixelRank] = { 
                discord_role_id: discordRole.id,
                ...(requirement !== null && { level_requirement: requirement })
            }

            await updateGuildData(interaction.guild, { roleMappings });

            const requirementText = requirement !== null ? ` (Level Requirement: **${requirement}**)` : '';
            await interaction.editReply({ embeds: [embeds.successEmbed(`Linked **${hypixelRank}** to <@&${discordRole.id}> successfully!${requirementText}`, interaction.guild.members.me.displayHexColor)], allowedMentions: { roles: [] } });
        } catch(err) {
            console.error("Failed to pull/update guild data: ", err);
            await interaction.editReply({ embeds: [embeds.errorEmbed("An error occurred while linking roles.")] });
        }
    }
}