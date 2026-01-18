const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * @command - /helpadmin
 * displays list of admin commands
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('helpadmin')
        .setDescription('Lists all available admin commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        const commands = [...interaction.client.commands.values()]
            .filter(cmd => cmd.adminOnly === true);
        
        const helpEmbed = new EmbedBuilder()
            .setTitle('List of Admin Commands')
            .setDescription(`Here's a list of all admin only commands`)
            .setColor(interaction.guild.members.me.displayHexColor)
            .setFooter({ text: 'For user commands, send /help' });

        commands.forEach(cmd => {
            helpEmbed.addFields({
                name: `/${cmd.data.name}${cmd.dangerous === true ? ' ⚠️ [DANGEROUS] ' : ''}`,
                value: cmd.data.description || 'No description provided',
                inline: false
            });
        });

        await interaction.reply({ embeds: [helpEmbed] });
    }
}