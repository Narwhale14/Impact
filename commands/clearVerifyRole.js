const { SlashCommandBuilder } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../utils/dbManager.js');

/**
 * @command - /clearverifyrole
 * clears the default verification role
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearverifyrole')
        .setDescription('Clears verification role'),
    adminOnly: true,
    async execute(interaction) {
        try {
            const guildData = await getGuildData(interaction.guild.id);
            if(!guildData?.verification_role) return await interaction.reply({ content: "No verification role is currently set!" });

            await updateGuildColumn(interaction.guild, 'verification_role', null);
            await interaction.reply({ content: `Verification role set successfully cleared.` });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.editReply("An error occured while clearing verification role!");
        }
    }
}