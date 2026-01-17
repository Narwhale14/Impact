const { SlashCommandBuilder } = require('discord.js');
const { updateGuildData, getGuildData } = require('../utils/guildDataManager.js');

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
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.hypixel_guild_id)
                return interaction.reply({ content: "This server is not linked to a Hypixel guild.\nPlease run: `/linkGuild <guild name>`"});

            const hypixelRank = interaction.options.getString('hypixel_rank').trim().toUpperCase();

            const roleMappings = guildDBData?.role_mappings || {};
            if(!roleMappings[hypixelRank])
                return interaction.reply({ content: `The guild rank **${hypixelRank}** is not current linked to any discord role!` });
            delete roleMappings[hypixelRank];
            await updateGuildData(interaction.guild, { roleMappings });

            await interaction.reply({ content: `Unlinked **${hypixelRank}** from it's discord role successfully!`, allowedMentions: { roles: [] } });
        } catch(err) {
            console.error("Failed to pull/update guild data: ", err);
            await interaction.reply({ content: "An error occurred while unlinking roles." });
        }
    }
}