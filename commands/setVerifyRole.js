const { SlashCommandBuilder } = require('discord.js');
const { updateGuildData } = require('../utils/dbManager.js');

/**
 * @command - /setverifyrole
 * sets the default verification role so the verify message builder commands can use it
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setverifyrole')
        .setDescription('Sets role to use for verification')
        .addRoleOption(option => option.setName('role').setDescription('Role of choice').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        try {
            const verificationRole = interaction.options.getRole('role');
            if(!verificationRole) return interaction.reply({ content: 'Invalid role!' });

            await updateGuildData(interaction.guild, { verificationRoleId: verificationRole.id});
            await interaction.reply({ content: `Verification role set successfully to <@&${verificationRole.id}>!`, allowedMentions: { roles: [] } });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.editReply("An error occured while setting verification role!");
        }
    }
}