const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guildmembers')
        .setDescription('Fetches the in-game guild members'),
    async execute(interaction) {
        
    }
}