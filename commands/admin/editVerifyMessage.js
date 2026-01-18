const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /editverifymessage
 * directly edits a verification message in a specific channel by ID and channel
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('editverifymessage')
        .setDescription('Changes the verification message')
        .addStringOption(option => option.setName('message').setDescription('The new verification message').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Channel of the verification message').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('ID of the verification message').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        const newMessage = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel');
        const verificationMessageId = await interaction.options.getString('id')
        if (!verificationMessageId) return interaction.reply({ embeds: [embeds.errorEmbed('Verification message does not exist!')] });

        try {
            const message = await channel.messages.fetch(verificationMessageId);
            await message.edit({ content: newMessage, components: message.components });
            await interaction.reply({ embeds: [embeds.successEmbed('Verification message edited!', interaction.guild.members.me.displayHexColor)] });
        } catch(err) {
            console.error(err);
            await interaction.reply({ embeds: [embeds.errorEmbed('Failed to edit verification message.')] });
        }
    }
};