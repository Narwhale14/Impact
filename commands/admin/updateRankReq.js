const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildData, getGuildData } = require('../../utils/guildDataManager.js');
const { getGuildById } = require('../../utils/hypixelAPIManager.js');

/**
 * @command - /updaterankreq
 * Updates the requirements of an already linked rank
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('updaterankreq')
        .setDescription('Updates requirements of a linked rank')
        .addStringOption(option => option.setName('hypixel_rank').setDescription('Guild rank').setRequired(true))
        .addIntegerOption(option => option.setName('requirement').setDescription('Skyblock level requirement').setMinValue(0).setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.hypixel_guild_id)
                return interaction.editReply({ content: "This server is not linked to a Hypixel guild\nPlease run: `/linkGuild <guild name>`"});

            const hypixelRank = interaction.options.getString('hypixel_rank').trim().toUpperCase();
            const newRequirement = interaction.options.getInteger('requirement');

            // api call
            const hypixelGuild = await getGuildById(guildDBData.hypixel_guild_id);
            if(!hypixelGuild.ranks.find(r => r.tag?.trim().toUpperCase() === hypixelRank))
                return interaction.editReply({ content: `The guild rank **${hypixelRank}** does not exist in Hypixel guild **${hypixelGuild.name}**`} );

            const roleMappings = guildDBData?.role_mappings || {};
            if(!roleMappings[hypixelRank])
                return interaction.editReply({ content: `The guild rank** ${hypixelRank}** is not linked yet.\nPlease run: \`/linkrole <hypixel rank> <server role> <optional: requirement>\``});

            // set data
            roleMappings[hypixelRank].level_requirement = newRequirement;
            await updateGuildData(interaction.guild, { roleMappings });

            await interaction.editReply({ content: `Updated the **${hypixelRank}** level requirement to **${newRequirement}**.`});
        } catch(err) {
            console.error("Failed to update rank requirement: ", err);
            await interaction.editReply({ content: "An error occurred while updating the role requirement." });
        }
    }
}