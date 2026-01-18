const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /setverifyrole
 * sets the default verification role so the verify message builder commands can use it
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setverifyrole')
        .setDescription('Sets role to use for verification')
        .addRoleOption(option => option.setName('role').setDescription('Role of choice').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(guildDBData?.verification_role) return interaction.reply({ embeds: [embeds.errorEmbed(`The verification role is already set to <@&${guildDBData.verification_role}>.`)], allowedMentions: { roles: [] }});

            const verificationRole = interaction.options.getRole('role');
            if(!verificationRole) return interaction.reply({ embeds: [embeds.errorEmbed('Invalid role!')] });

            await updateGuildColumn(interaction.guild, 'verification_role', verificationRole.id);
            await interaction.reply({ embeds: [embeds.successEmbed(`Verification role set successfully to <@&${verificationRole.id}>!`, interaction.guild.members.me.displayHexColor)], allowedMentions: { roles: [] } });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.reply({ embeds: [embeds.errorEmbed("An error occured while setting verification role!")] });
        }
    }
}