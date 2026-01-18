const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /deleteverifymessage
 * removes a verification message in a specific channel by ID and channel
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteverifymessage')
        .setDescription('Deletes a verification message')
        .addChannelOption(option => option.setName('channel').setDescription('Channel of the verification message').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('ID of the verification message').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const verificationMessageId = await interaction.options.getString('id')
        if (!verificationMessageId) return interaction.reply({ embeds: [embeds.errorEmbed('Verification message does not exist!')] });

        try {
            const message = await channel.messages.fetch(verificationMessageId);
            await message.delete();
            await interaction.reply({ embeds: [embeds.successEmbed('Verification message deleted!', interaction.guild.members.me.displayHexColor)] });
        } catch(err) {
            console.error(err);
            await interaction.reply({ embeds: [embeds.errorEmbed('Failed to delete verification message.')] });
        }
    }
};