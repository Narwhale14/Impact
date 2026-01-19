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

        commands.forEach(command => {
            const subcommands = command.data.options?.filter(option => option.constructor.name === 'SlashCommandSubcommandBuilder');
            if(subcommands && subcommands.length > 0) {
                command.data.options.filter(option => option.constructor.name === 'SlashCommandSubcommandBuilder').forEach(sub => { 
                    const isDangerous = command.dangerousSubcommands?.includes(sub.name);
                    helpEmbed.addFields({
                        name: `/${command.data.name} ${sub.name}${isDangerous === true ? ' ⚠️ [DANGEROUS] ' : ''}`,
                        value: `${sub.description}`,
                        inline: false
                    });
                });
            } else {
                helpEmbed.addFields({
                    name: `/${command.data.name}${command.dangerous === true ? ' ⚠️ [DANGEROUS] ' : ''}`,
                    value: command.data.description || 'No description provided',
                    inline: false
                });
            }
        });

        await interaction.reply({ embeds: [helpEmbed] });
    }
}