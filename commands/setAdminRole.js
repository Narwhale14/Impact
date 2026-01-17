const { SlashCommandBuilder } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../utils/guildDataManager.js');

/**
 * @command - /setadminrole
 * sets the default staff role so the bot knows who to give access to admin commands
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setadminrole')
        .setDescription('Sets role to use for admin commands')
        .addRoleOption(option => option.setName('role').setDescription('Role of choice').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(guildDBData?.admin_role) return interaction.reply({ content: `The admin role is already set to <@&${guildDBData.admin_role}>.`});

            const adminRole = interaction.options.getRole('role');
            if(!adminRole) return interaction.reply({ content: 'Invalid role!', flag: 64 });

            await updateGuildColumn(interaction.guild, 'admin_role', adminRole.id);
            await interaction.reply({ content: `Admin role set successfully to <@&${adminRole.id}>!\n**WARNING: Anyone with this role can use admin commands!**`, allowedMentions: { roles: [] } });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.reply({ content: "An error occured while setting admin role!" });
        }
    }
}