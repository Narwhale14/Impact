const { SlashCommandBuilder } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../utils/dbManager.js');

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
            const guildData = await getGuildData(interaction.guild.id);
            if(guildData?.verification_role) return interaction.reply({ content: `The verification role is already set to <@&${guildData.verification_role}>.`});

            const verificationRole = interaction.options.getRole('role');
            if(!verificationRole) return interaction.reply({ content: 'Invalid role!' });

            await updateGuildColumn(interaction.guild, 'verification_role', verificationRole.id);
            await interaction.reply({ content: `Verification role set successfully to <@&${verificationRole.id}>!`, allowedMentions: { roles: [] } });
        } catch(err) {
            console.log('Error updating guild data: ', err);
            await interaction.reply({ content: "An error occured while setting verification role!" });
        }
    }
}