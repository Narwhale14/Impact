const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setadminrole')
        .setDescription('Sets role to use for admin commands')
        .addRoleOption(option => option.setName('role').setDescription('Role of choice').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const adminRole = interaction.options.getRole('role');
        if(!adminRole) return interaction.reply({ content: 'Invalid role!', flag: 64 });

        // lazy-load db to avoid starting db on deploy
        const { updateGuildData } = require('../utils/dbManager.js');
        await updateGuildData(interaction.guild, { adminRoleId: adminRole.id});

        await interaction.reply({ content: 'Admin role set successfully', flag: 64 });
    }
}