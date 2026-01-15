const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setverifyrole')
        .setDescription('Sets role to use for verification')
        .addRoleOption(option => option.setName('role').setDescription('Role of choice').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const verificationRole = interaction.options.getRole('role');
        if(!verificationRole) return interaction.reply({ content: 'Invalid role!', flag: 64 });

        // lazy-load db to avoid starting db on deploy
        const { updateGuildData } = require('../utils/dbManager.js');
        await updateGuildData(interaction.guild.id, { verificationRoleId: verificationRole.id});

        await interaction.reply({ content: 'Verification role set successfully', flag: 64 });
    }
}