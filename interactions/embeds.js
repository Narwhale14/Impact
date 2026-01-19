const { EmbedBuilder } = require('discord.js');

const ERROR_COLOR = 0xED4245;
const WARNING_COLOR = 0xFEE75C;
const SUCCESS_COLOR = 0x57F287;

module.exports = {
    ERROR_COLOR,
    WARNING_COLOR,
    SUCCESS_COLOR,
    
    // super specific one
    guildNotLinked: () => {
        return new EmbedBuilder()
            .setTitle('ERROR')
            .setDescription('Discord server is not linked to a Hypixel guild!')
            .setColor(ERROR_COLOR)
            .setTimestamp()
    },

    // success message
    successEmbed: (message, color = SUCCESS_COLOR, title = 'SUCCESS' ) => {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setColor(color)
            .setTimestamp()
    },

    // error message
    errorEmbed: (message, title = 'ERROR') => {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setColor(ERROR_COLOR)
            .setTimestamp()
    }
}