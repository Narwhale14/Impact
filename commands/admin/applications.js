const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const { sendButtonMessage, editBotMessage } = require('../../utils/interactionHelpers.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /applications
 * guildappchannel stuff
 * 
 * /applications channel set
 * /applications channel clear
 * /applications logs set
 * /applications logs clear
 * /applications logs role
 * /applications message create
 * /applications message edit
 * /applications setrole
 * /applications clearrole
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
                .addBooleanOption(option => option.setName('on').setDescription('On/Off').setRequired(true))))
        .addSubcommandGroup(group => group.setName('message').setDescription('Guild application message subcommand group')
            .addSubcommand(sub => sub
                .setName('create')
                .setDescription('Creates a guild application message')
                .addStringOption(option => option.setName('message').setDescription('Application message content').setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('Channel to send the message in').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('edit')
                .setDescription('Edits a guild application message')
                .addStringOption(option => option.setName('message').setDescription('Application message content').setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('Channel to send the message in').setRequired(true))
                .addStringOption(option => option.setName('id').setDescription('Application message ID').setRequired(true))))
        .addSubcommand(sub => sub
            .setName('setrole')
            .setDescription('Sets the guild member role')
            .addRoleOption(option => option.setName('role').setDescription('Guild member role').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('clearrole')
            .setDescription('Clears verification role')),
        adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();
        const guildDBData = await getGuildData(interaction.guild);

        // for indentical sub commands in groups 'channel' and 'log'
        let channelColumn = null;
        let channelString = null;
        if(group === 'channel') {
            channelColumn = 'application_channel_id';
            channelString = 'application channel';
        } else if(group === 'log') {
            channelColumn = 'application_channel_id';
            channelString = 'requests channel';
        }

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

        // app message subcommand group
        if(group === 'message') {
            // app message create subcommand
            if(sub === 'create') {
                const message = interaction.options.getString('message');
                const channel = interaction.options.getChannel('channel');
                if(!guildDBData?.guild_member_role) return interaction.editReply({ embeds: [embeds.errorEmbed('Application role does not exist!')] });
    
                try {
                    await sendButtonMessage(channel, message, 'apply_button', 'Apply');
                    await interaction.editReply({ embeds: [embeds.successEmbed(`Application message created successfully in ${channel}`, interaction.guild.members.me.displayHexColor)] });
                } catch(err) {
                    console.error("Failed running '/applications message create': ", err);
                    return interaction.editReply({ embeds: [embeds.errorEmbed(`Unable to send message in this channel!\nCheck my bot perms and double check that I have message perms in ${channel}!`)] });
                }
            }

            // app message create subcommand
            if(sub === 'edit') {
                const message = interaction.options.getString('message');
                const messageId = interaction.options.getString('id');
                const channel = interaction.options.getChannel('channel');
    
                try {
                    await editBotMessage(channel, message, messageId);
                    await interaction.editReply({ embeds: [embeds.successEmbed('Application message edited!', interaction.guild.members.me.displayHexColor)] });
                } catch {
                    console.error("Failed running '/applications message edit': ", err);
                    return interaction.editReply({ embeds: [embeds.errorEmbed('Message not found in this channel')] });
                }
            }
        }

        // applications setrole subcommand
        if(sub === 'setrole') {
            if(guildDBData?.guild_member_role) return interaction.reply({ embeds: [embeds.errorEmbed(`The application role is already set to <@&${guildDBData.verification_role}>.`)], allowedMentions: { roles: [] }});
            const applyRole = interaction.options.getRole('role');
            if(!applyRole) return interaction.editReply({ embeds: [embeds.errorEmbed('Invalid role!')] });

            try {
                await updateGuildColumn(interaction.guild, 'guild_member_role', applyRole.id);
                await interaction.editReply({ embeds: [embeds.successEmbed(`Application role set successfully to <@&${applyRole.id}>!`, interaction.guild.members.me.displayHexColor)], allowedMentions: { roles: [] } });
            } catch(err) {
                console.error("Failed running '/applications setrole': ", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed("An error occurred while setting application role.")] });
            } 
        }

        // applications clearrole subcommand
        if(sub === 'clearrole') {
            if(!guildDBData?.guild_member_role) return interaction.editReply({ embeds: [embeds.errorEmbed('Application role does not exist!')] });
            
            try {
                await updateGuildColumn(interaction.guild, 'guild_member_role', null);
                await interaction.editReply({ embeds: [embeds.successEmbed('Set application role cleared.', interaction.guild.members.me.displayHexColor)] });
            } catch(err) {
                console.error("Failed running '/application clearrole': ", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed("An error occurred while clearing application role.")] });
            } 
        }
    }
}