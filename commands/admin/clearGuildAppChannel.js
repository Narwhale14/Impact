const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /clearguildappchannel
 * clears the default guild requests channel
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearguildappchannel')
        .setDescription('Clears channel used for guild rank and application requests')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.application_channel_id) return interaction.reply({ embeds: [embeds.errorEmbed('Guild application channel does not exist!')] });

            await updateGuildColumn(interaction.guild, 'application_channel_id', null);
            await interaction.reply({ embeds: [embeds.successEmbed('Set guild application channel cleared.', interaction.guild.members.me.displayHexColor)] });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.reply({embeds: [embeds.errorEmbed("An error occured while clearing guild application channel role!")] });
        }
    }
}