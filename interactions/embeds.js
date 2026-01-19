const { EmbedBuilder } = require('discord.js');

const ERROR_COLOR = 0xED4245;
const WARNING_COLOR = 0xFEE75C;

module.exports = {
    ERROR_COLOR,
    WARNING_COLOR,
    
    // super specific one
    guildNotLinked: () => {
        return new EmbedBuilder()
            .setTitle('ERROR')
            .setDescription('Discord server is not linked to a Hypixel guild!')
            .setColor(ERROR_COLOR)
            .setTimestamp()
    },

    // success message
    successEmbed: (message, color, title = 'SUCCESS') => {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setColor(color)
            .setTimestamp()
    },

    // error message
    errorEmbed: (message, title = 'Error') => {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setColor(ERROR_COLOR)
            .setTimestamp()
    }
}