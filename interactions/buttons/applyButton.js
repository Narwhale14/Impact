const { getGuildData } = require('../../utils/guildDataManager.js');

module.exports = {
    customId: 'apply_button',
    async execute(interaction) {
        interaction.reply("hello");
    }
}