const { SlashCommandBuilder, InteractionResponseFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteverifymessage')
        .setDescription('Deletes the verification message')
        .addChannelOption(option => option.setName('channel').setDescription('Channel of the verification message').setRequired(true))
        .addStringOption(option => option.setName('id').setDescription('ID of the verification message').setRequired(true)),
    async execute(interaction) {
        if(!interaction.isChatInputCommand()) return;
        if(!interaction.member.roles.cache.has(process.env.ADMIN_ROLE_ID))
            return interaction.reply({ content: 'You do not have permissions to run this command.', flags: 64 });

        const channel = interaction.options.getChannel('channel');
        const verificationMessageId = await interaction.options.getString('id')
        if (!verificationMessageId) return interaction.reply({ content: 'Verification message does not exist!', flags: 64 });

        try {
            const message = await channel.messages.fetch(verificationMessageId);
            await message.delete();
            await interaction.reply({ content: 'Verification message deleted!', flags: 64 });
        } catch(err) {
            console.error(err);
            await interaction.reply({ content: 'Failed to delete verification message.', flags: 64 });
        }
    }
};