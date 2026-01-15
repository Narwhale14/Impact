const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendverifymessage')
        .setDescription('Sends the verification message')
        .addStringOption(option => option.setName('message').setDescription('Sends the new verification message').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel it goes in').setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const content = interaction.options.getString('message');
        const welcomeChannel = interaction.options.getChannel('channel');

        // invalid channel
        if(!welcomeChannel || !welcomeChannel.isTextBased())
            return interaction.reply({ content: 'Invalid channel!', flags: 64 });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('verify_button').setLabel('Verify').setStyle(ButtonStyle.Success)
        );
        
        // send message, save unique message ID
        const messagePayload = {content, components: [row]};
        const message = await welcomeChannel.send(messagePayload);
        await interaction.reply({ content: `Verification message created successfully in ${welcomeChannel}` });
    }
};