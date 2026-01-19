const {EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

function createPageEmbed(interaction, commands, pageNumber, totalPages, userType) {
    const embed = new EmbedBuilder()
        .setTitle(`List of ${userType} Commands`)
        .setDescription(`Page ${pageNumber + 1} / ${totalPages}`)
        .setColor(interaction.guild.members.me.displayHexColor)
        .setFooter({ text: 'Use the buttons to navigate pages' });

    commands.forEach(command => {
        embed.addFields({
            name: command.name + (command.dangerous ? ' ⚠️ [DANGEROUS]' : ''),
            value: command.description || 'No description provided',
            inline: false
        });
    });

    return embed;
}

function flattenCommands(command) {
    const options = command.data.toJSON().options ?? [];
    const groups = options.filter(option => option.type === ApplicationCommandOptionType.SubcommandGroup);
    const subs = options.filter(option => option.type === ApplicationCommandOptionType.Subcommand);

    const result = [];

    groups.forEach(group => { 
        group.options.forEach(sub => { 
            result.push({
                name: `/${command.data.name} ${group.name} ${sub.name}`,
                description: sub.description,
                dangerous: command.dangerousSubcommands?.includes(`${group.name}.${sub.name}`) || false
            });
        });
    });

    subs.forEach(sub => { 
        result.push({
            name: `/${command.data.name} ${sub.name}`,
            description: sub.description,
            dangerous: command.dangerousSubcommands?.includes(sub.name) || false
        });
    });

    if(groups.length === 0 && subs.length === 0) {
        result.push({
            name: `/${command.data.name}`,
            description: command.data.description,
            dangerous: false
        });
    }

    return result;
}

module.exports = { createPageEmbed, flattenCommands }