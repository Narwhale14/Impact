const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editverificationmessage')
        .setDescription('Changes the verification message')
        .addStringOption(option => option.setName('message').setDescription('The new verification message').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Channel of the verification message').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('ID of the verification message').setRequired(true)),
    async execute(interaction) {
        if(!interaction.isChatInputCommand()) return;
        if(!interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID))
            return interaction.reply({ content: 'You do not have permissions to run this command.' });

        const newMessage = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel');
        const verificationMessageId = await interaction.options.getString('id')
        if (!verificationMessageId) return interaction.reply({ content: 'Verification message does not exist!' });

        try {
            const message = await channel.messages.fetch(verificationMessageId);
            await message.edit({ content: newMessage, components: message.components });
            await interaction.reply({ content: 'Verification message edited!' });
        } catch(err) {
            console.error(err);
            await interaction.reply({ content: 'Failed to edit verification message.' });
        }
    }
};