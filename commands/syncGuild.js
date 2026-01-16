const { SlashCommandBuilder } = require('discord.js');
const { getGuildData, updateGuildData } = require('../utils/dbManager');
const { getGuildByName } = require('../utils/hypixelAPIManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('syncguild')
        .setDescription('Sync discord server with hypixel guild')
        .addStringOption(option => option.setName('guild').setDescription('Guild of choice').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildName = interaction.options.getString('guild');

            // checks if guild exists
            const hypixelGuild = getGuildByName(guildName);
            if(!hypixelGuild) return interaction.editReply(`Guild **${guildName}** not found on Hypixel.`)

            const hypixelGuildId = hypixelGuild._id;
            await updateGuildData(interaction.guild, { hypixelGuildId });

            await interaction.editReply(`Successfully synced guild **${guildName}** to this server!`);
        } catch(err) {
            console.error("Error fectching guild: ", err);
            await interaction.editReply("An error occured while fetching guild");
        }
    }
}