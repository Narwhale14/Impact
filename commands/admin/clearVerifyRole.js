const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /clearverifyrole
 * clears the default verification role
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearverifyrole')
        .setDescription('Clears verification role')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.verification_role) return interaction.reply({ embeds: [embeds.errorEmbed('Verification role does not exist!')] });

            await updateGuildColumn(interaction.guild, 'verification_role', null);
            await interaction.reply({ embeds: [embeds.successEmbed('Set verification role cleared.', interaction.guild.members.me.displayHexColor)] });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.reply({embeds: [embeds.errorEmbed("An error occured while clearing verification role!")] });
        }
    }
}