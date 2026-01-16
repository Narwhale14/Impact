const { SlashCommandBuilder } = require('discord.js');
const { getGuildData, updateGuildData } = require('../utils/dbManager');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('syncguild')
        .setDescription('Sync discord server with hypixel guild')
        .addStringOption(option => option.setName('guild').setDescription('Guild of choice').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildName = interaction.options.getString('guild');
            const response = await fetch(`https://api.hypixel.net/guild?name=${encodeURIComponent(guildName)}&key=${process.env.HYPIXEL_API_KEY}`);
            const data = await response.json();

            // verify connection to api
            if (!data.success)
                return interaction.editReply(`Hypixel API error: ${data.cause || 'Unknown error'}`);

            // checks if guild exists
            const hypixelGuild = data.guild;
            if(!hypixelGuild) return interaction.editReply(`Guild **${guildName}** not found on Hypixel.`)

            const hypixelGuildId = hypixelGuild._id;
            await updateGuildData(interaction.guild, { hypixelGuildId });

            await interaction.editReply(`Successfully synced guild **${guildName}** to this server!`);
        } catch(err) {
            console.error(err);
            await interaction.editReply("An error occured while fetching guild");
        }
    }
}