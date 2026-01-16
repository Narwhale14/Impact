const { SlashCommandBuilder } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../utils/dbManager.js');

/**
 * @command - /clearadminrole
 * clears the default admin role
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearadminrole')
        .setDescription('Clears admin role'),
    adminOnly: true,
    async execute(interaction) {
        try {
            const guildData = await getGuildData(interaction.guild.id);
            if(!guildData?.admin_role) return await interaction.reply({ content: "No admin role is currently set!" });

            await updateGuildColumn(interaction.guild, 'admin_role', null);
            await interaction.reply({ content: `Admin role set successfully cleared.` });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.editReply("An error occured while clearing admin role!");
        }
    }
}