const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../utils/guildDataManager.js');

/**
 * @command - /clearadminrole
 * clears the default admin role
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearadminrole')
        .setDescription('Clears admin role')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.admin_role) return await interaction.reply({ content: "No admin role is currently set!" });

            await updateGuildColumn(interaction.guild, 'admin_role', null);
            await interaction.reply({ content: `Admin role set successfully cleared.` });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.editReply("An error occured while clearing admin role!");
        }
    }
}