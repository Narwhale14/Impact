const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /applications
 * guildappchannel stuff
 * 
 * /applications channel set
 * /applications channel clear
 * /applications logs set
 * /applications logs clear
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('applications')
        .setDescription('Manages server guild applications and mod stuff')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup(group => group.setName('channel').setDescription('Guild application channel')
            .addSubcommand(sub => sub
                .setName('set')
                .setDescription('Sets the guild application channel')
                .addChannelOption(option => option.setName('channel').setDescription('Channel for guild application message').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('clear')
                .setDescription('Clears connection to the guild application channel')))
        .addSubcommandGroup(group => group.setName('log').setDescription('Guild application logs channel subcommand group')
            .addSubcommand(sub => sub
                .setName('set')
                .setDescription('Sets the guild application logs channel')
                .addChannelOption(option => option.setName('channel').setDescription('Channel for staff to review applications').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('clear')
                .setDescription('Clears connection to the guild application logs channel'))
            .addSubcommand(sub => sub
                .setName('roles')
                .setDescription('Turns on role requests (no ping)')
                .addBooleanOption(option => option.setName('on').setDescription('On/Off').setRequired(true)))),
        adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();
        const guildDBData = await getGuildData(interaction.guild);

        const channelColumn = group === 'channel' ? 'application_channel_id' : group === 'log' ? 'logs_channel_id' : null;
        const channelString = channelColumn === 'application_channel_id' ? 'application channel' : channelColumn === 'logs_channel_id' ? 'requests channel' : null;
        if(!channelColumn || !channelString) return;

        // apps channel/logs set subcommands
        if(sub === 'set') {
            if(guildDBData?.[channelColumn]) 
                return interaction.editReply({ embeds: [embeds.errorEmbed(`Guild ${channelString} is already set to <#${guildDBData[channelColumn]}>.`)] });
            const channel = interaction.options.getChannel('channel');
            if(!channel) return interaction.editReply({ embeds: [embeds.errorEmbed(`Invalid guild ${channelString}.`)] });

            try {
                await updateGuildColumn(interaction.guild, channelColumn, channel.id);
                await interaction.editReply({ embeds: [embeds.successEmbed(`Guild ${channelString} set successfully to <#${channel.id}>!`, interaction.guild.members.me.displayHexColor)] });
            } catch(err) {
                console.error("Failed running '/apps <subcommandGroup> set': ", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed(`An error occurred while setting guild ${channelString}.`)] });
            } 
        }

        // apps channel/logs clear subcommands
        if(sub === 'clear') {
            if(!guildDBData?.[channelColumn]) 
                return interaction.editReply({ embeds: [embeds.errorEmbed(`Guild ${channelString} not set yet!`)] });

            try {
                await updateGuildColumn(interaction.guild, channelColumn, null);
                await interaction.editReply({ embeds: [embeds.successEmbed(`Guild ${channelString} connection cleared.`, interaction.guild.members.me.displayHexColor)] });
            } catch(err) {
                console.error("Failed running '/apps <subcommandGroup> clear': ", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed(`An error occurred while clearing guild ${channelString}.`)] });
            } 
        }

        // apps log roles subcommand
        if(sub === 'roles') {
            const rolesToggle = interaction.options.getBoolean('on');
            if(guildDBData?.requests_enabled === rolesToggle) 
                return interaction.editReply({ embeds: [embeds.errorEmbed(`Already toggled to **${rolesToggle}**!`)] });
            if(!guildDBData?.logs_channel_id)
                return interaction.editReply({ embeds: [embeds.errorEmbed(`Logs channel not configured!\nPlease run: \`/applications log set <#channel>\``)] });
            try {
                await updateGuildColumn(interaction.guild, 'requests_enabled', rolesToggle);
                await interaction.editReply({ embeds: [embeds.successEmbed(`Toggled role requests to **${rolesToggle}**!\nThey will be sent in <#${guildDBData.logs_channel_id}>`, interaction.guild.members.me.displayHexColor)] });
            } catch(err) {
                console.error("Failed running '/apps log roles'", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed(`An error occured while toggling role logs!`)] });
            }
        }
    }
}