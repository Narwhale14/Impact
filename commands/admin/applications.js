const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /application
 * guildappchannel stuff
 * 
 * /application setchannel
 * /application clearchannel
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('application')
        .setDescription('Manages guild applications')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('setchannel')
            .setDescription('Sets the guild application channel')
            .addChannelOption(option => option.setName('channel').setDescription('Channel for guild application message').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('clearchannel')
            .setDescription('Clears the guild application channel')),
        adminOnly: true,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildDBData = await getGuildData(interaction.guild);

        // setchannel subcommand
        if(subcommand === 'setchannel') {
            const requestsChannel = interaction.options.getChannel('channel');

            if(guildDBData?.application_channel_id) return interaction.reply({ embeds: [embeds.errorEmbed(`The guild application channel is already set to <#${guildDBData.guild_channel_id}>.`)] });
            if(!requestsChannel) return interaction.reply({ embeds: [embeds.errorEmbed('Invalid channel!')] });

            try {
                await updateGuildColumn(interaction.guild, 'application_channel_id', requestsChannel.id);
                await interaction.reply({ embeds: [embeds.successEmbed(`Guild application channel set successfully to <#${requestsChannel.id}>!`, interaction.guild.members.me.displayHexColor)] });
            } catch(err) {
                console.error("Failed running '/applications setchannel': ", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed("An error occurred while setting application channel.")] });
            } 
        }

        // clearchannel subcommand
        if(subcommand === 'clearchannel') {
            if(!guildDBData?.application_channel_id) return interaction.reply({ embeds: [embeds.errorEmbed(`The guild application channel isn't set yet!`)] });

            try {
                await updateGuildColumn(interaction.guild, 'application_channel_id', null);
                await interaction.reply({ embeds: [embeds.successEmbed('Set guild application channel cleared.', interaction.guild.members.me.displayHexColor)] });
            } catch(err) {
                console.error("Failed running '/applications clearchannel': ", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed("An error occurred while clearing set application channel.")] });
            } 
        }
    }
}