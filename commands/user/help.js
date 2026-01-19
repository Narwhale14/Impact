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
            .setColor(interaction.guild.members.me.displayHexColor)
            .setFooter({ text: 'For admin commands, send /helpadmin' });

        commands.forEach(command => {
            const subcommands = command.data.options?.filter(option => option.constructor.name === 'SlashCommandSubcommandBuilder');
            if(subcommands && subcommands.length > 0) {
                command.data.options.filter(option => option.constructor.name === 'SlashCommandSubcommandBuilder').forEach(sub => { 
                    helpEmbed.addFields({
                        name: `/${command.data.name} ${sub.name}}`,
                        value: `${sub.description}`,
                        inline: false
                    });
                });
            } else {
                helpEmbed.addFields({
                    name: `/${command.data.name}}`,
                    value: command.data.description || 'No description provided',
                    inline: false
                });
            }
        });

        await interaction.reply({ embeds: [helpEmbed] });
    }
}