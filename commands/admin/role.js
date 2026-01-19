const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildData, getGuildData } = require('../../utils/guildDataManager.js');
const { getGuildById } = require('../../utils/hypixelAPIManager.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /role
 * manages linking discord roles to ingame ranks
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Links in-game guild rank with discord role')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('link')
            .setDescription('Link discord role to hypixel guild rank')
            .addStringOption(option => option.setName('hypixel_rank').setDescription('Guild rank').setRequired(true))
            .addRoleOption(option => option.setName('server_role').setDescription('Server role').setRequired(true))
            .addIntegerOption(option => option.setName('requirement').setDescription('Skyblock level requirement').setMinValue(0).setRequired(false)))
        .addSubcommand(sub => sub
            .setName('unlink')
            .setDescription('Unlink discord role to hypixel guild rank')
            .addStringOption(option => option.setName('hypixel_rank').setDescription('Guild rank').setRequired(true))),
        adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        try {
            const guildDBData = await getGuildData(interaction.guild.id);

            if(subcommand === 'link') {
                if(!guildDBData?.hypixel_guild_id) return interaction.editReply({ embeds: [embeds.guildNotLinked()] });

                const hypixelRank = interaction.options.getString('hypixel_rank').trim().toUpperCase();
                const discordRole = interaction.options.getRole('server_role');
                const requirement = interaction.options.getInteger('requirement');

                const hypixelGuild = await getGuildById(guildDBData.hypixel_guild_id);
                if(!hypixelGuild.ranks.find(r => r.tag?.trim().toUpperCase() === hypixelRank))
                    return interaction.editReply({ embeds: [embeds.errorEmbed(`The guild rank **${hypixelRank}** does not exist in Hypixel guild **${hypixelGuild.name}**`)] });

                const roleMappings = guildDBData?.role_mappings || {};
                if(roleMappings[hypixelRank])
                    return interaction.editReply({ embeds: [embeds.errorEmbed(`The guild rank **${hypixelRank}** is already linked to <@&${roleMappings[hypixelRank].discord_role_id}>!`)], allowedMentions: { roles: [] } });

                roleMappings[hypixelRank] = { 
                    discord_role_id: discordRole.id,
                    ...(requirement !== null && { level_requirement: requirement })
                }

                await updateGuildData(interaction.guild, { roleMappings });

                const requirementText = requirement !== null ? ` (Level Requirement: **${requirement}**)` : '';
                await interaction.editReply({ embeds: [embeds.successEmbed(`Linked **${hypixelRank}** to <@&${discordRole.id}> successfully!${requirementText}`, interaction.guild.members.me.displayHexColor)], allowedMentions: { roles: [] } });
            }

            if(subcommand === 'unlink') {
                if(!guildDBData?.hypixel_guild_id) return interaction.editReply({ embeds: [embeds.guildNotLinked()] });
                
                const hypixelRank = interaction.options.getString('hypixel_rank').trim().toUpperCase();
    
                const roleMappings = guildDBData?.role_mappings || {};
                if(!roleMappings[hypixelRank])
                    return interaction.editReply({ embeds: [embeds.errorEmbed(`The guild rank **${hypixelRank}** is not current linked to any discord role!`)] });
                delete roleMappings[hypixelRank];
                await updateGuildData(interaction.guild, { roleMappings });
    
                await interaction.editReply({ embeds: [embeds.successEmbed(`Unlinked **${hypixelRank}** from it's discord role successfully!`, interaction.guild.members.me.displayHexColor)], allowedMentions: { roles: [] } });
            }

        } catch(err) {
            console.error("Failed to pull/update guild data: ", err);
            await interaction.editReply({ embeds: [embeds.errorEmbed("An error occurred while linking roles.")] });
        }
    }
}