const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

/**
 * @command - /help
 * displays list of commands
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available user commands'),
    async execute(interaction) {
        const commands = [...interaction.client.commands.values()]
            .filter(cmd => cmd.adminOnly !== true)
            .sort((a, b) => a.data.name.localeCompare(b.data.name));
        
        const helpEmbed = new EmbedBuilder()
            .setTitle('List of Commands')
            .setDescription(`Here's a list of all commands`)
            .setColor(interaction.member.displayHexColor)
            .setFooter({ text: 'For admin commands, send /helpadmin' });

        commands.forEach(cmd => {
            helpEmbed.addFields({
                name: `/${cmd.data.name}`,
                value: cmd.data.description || 'No description provided',
                inline: false
            });
        });

        await interaction.reply({ embeds: [helpEmbed] });
    }
}