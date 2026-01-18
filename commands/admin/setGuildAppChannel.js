const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /setguildappchannel
 * sets the default guild requests channel
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setguildappchannel')
        .setDescription('Sets channel to use for guild rank and application requests')
        .addChannelOption(option => option.setName('channel').setDescription('Channel of choice').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(guildDBData?.application_channel_id) return interaction.reply({ embeds: [embeds.errorEmbed(`The guild application channel is already set to <#${guildDBData.guild_channel_id}>.`)] });

            const requestsChannel = interaction.options.getChannel('channel');
            if(!requestsChannel) return interaction.reply({ embeds: [embeds.errorEmbed('Invalid channel!')] });

            await updateGuildColumn(interaction.guild, 'application_channel_id', requestsChannel.id);
            await interaction.reply({ embeds: [embeds.successEmbed(`Guild application channel set successfully to <#${requestsChannel.id}>!`, interaction.guild.members.me.displayHexColor)] });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.reply({ embeds: [embeds.errorEmbed("An error occured while setting guild application channel!")] });
        }
    }
}