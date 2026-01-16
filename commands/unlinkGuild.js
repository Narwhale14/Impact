const { SlashCommandBuilder } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../utils/dbManager.js');

/**
 * @command - /unlinkguild
 * unlinks in game hypixel guild to discord server
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlinkguild')
        .setDescription('Unlinks discord server with hypixel guild'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const existingGuildData = await getGuildData(interaction.guild.id);
            if(!existingGuildData?.hypixel_guild_id) return interaction.editReply('This servier isn\'t linked to a guild yet!');

            // run in parallel
            await Promise.all([
                updateGuildColumn(interaction.guild.id, 'hypixel_guild_id', null),
                updateGuildColumn(interaction.guild.id, 'role_mappings', null)
            ]);

            await interaction.editReply(`Successfully unlinked any guild to this server!\nCleared linked roles!`);
        } catch(err) {
            console.error("Error fetching guild: ", err);
            await interaction.editReply("An error occured while fetching guild");
        }
    }
}