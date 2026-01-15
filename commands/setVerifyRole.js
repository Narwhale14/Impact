const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setverifyrole')
        .setDescription('Sets role to use for verification')
        .addStringOption(option => option.setName('role').setDescription('Role of choice').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        
    }
}