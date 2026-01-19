const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /guildappchannel
 * guildappchannel stuff
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('guildapplication')
        .setDescription('Manages channel to use for guild rank and application requests')
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
        const requestsChannel = interaction.options.getChannel('channel');

        try {
            const guildDBData = await getGuildData(interaction.guild.id);

            if(subcommand === 'setchannel') {
                if(guildDBData?.application_channel_id) return interaction.reply({ embeds: [embeds.errorEmbed(`The guild application channel is already set to <#${guildDBData.guild_channel_id}>.`)] });
                if(!requestsChannel) return interaction.reply({ embeds: [embeds.errorEmbed('Invalid channel!')] });

                await updateGuildColumn(interaction.guild, 'application_channel_id', requestsChannel.id);
                await interaction.reply({ embeds: [embeds.successEmbed(`Guild application channel set successfully to <#${requestsChannel.id}>!`, interaction.guild.members.me.displayHexColor)] });
            }

            if(subcommand === 'clearchannel') {
                if(!guildDBData?.application_channel_id) return interaction.reply({ embeds: [embeds.errorEmbed(`The guild application channel isn't set yet!`)] });

                await updateGuildColumn(interaction.guild, 'application_channel_id', null);
                await interaction.reply({ embeds: [embeds.successEmbed('Set guild application channel cleared.', interaction.guild.members.me.displayHexColor)] });
            }

            
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.reply({ embeds: [embeds.errorEmbed("An error occured while running /guildapplication")] });
        }
    }
}