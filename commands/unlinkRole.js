const { SlashCommandBuilder } = require('discord.js');
const { updateGuildData, getGuildData } = require('../utils/dbManager.js');
const { getGuildById } = require('../utils/hypixelAPIManager.js');

/**
 * @command - /unlinkrole
 * unlinks an in-game rank in the hypixel guild to a role in the discord
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlinkrole')
        .setDescription('Unlinks in-game guild rank with discord role')
        .addStringOption(option => option.setName('hypixel_rank').setDescription('Guild rank').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildData = await getGuildData(interaction.guild.id);
            if(!guildData?.hypixel_guild_id)
                return interaction.editReply({ content: "This server isn't linked to a Hypixel guild yet!\nPlease run: /linkGuild <guild name>"});

            const hypixelRank = interaction.options.getString('hypixel_rank').trim().toUpperCase();

            // check if user inputted hypixel role actually exists in guild
            const hypixelGuild = await getGuildById(guildData.hypixel_guild_id);
            if(!hypixelGuild.ranks.find(r => r.tag?.trim().toUpperCase() === hypixelRank))
                return interaction.editReply({ content: `The guild rank **${hypixelRank}** does not exist in Hypixel guild **${hypixelGuild.name}**`} );

            const roleMappings = guildData?.role_mappings || {};
            if(!roleMappings[hypixelRank])
                return interaction.editReply({ content: `The guild rank **${hypixelRank}** is not current linked to any discord role!` });
            delete roleMappings[hypixelRank];
            await updateGuildData(interaction.guild, { roleMappings });

            await interaction.editReply({ content: `Unlinked **${hypixelRank}** from it's discord role successfully!`, allowedMentions: { roles: [] } });
        } catch(err) {
            console.error("Failed to pull/update guild data: ", err);
            await interaction.editReply({ content: "An error occurred while unlinking roles." });
        }
    }
}