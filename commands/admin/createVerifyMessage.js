const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

/**
 * @command - /createverifymessage
 * creates a message in a specific channel that has a button to add
 * the saved verification role via /setverifyrole
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('createverifymessage')
        .setDescription('Creates the verification message')
        .addStringOption(option => option.setName('message').setDescription('Sends the new verification message').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel it goes in').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        const content = interaction.options.getString('message');
        const welcomeChannel = interaction.options.getChannel('channel');

        if(!welcomeChannel || !welcomeChannel.isTextBased())
            return interaction.reply({ content: 'Invalid channel!', flags: 64 });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('verify_button').setLabel('Verify').setStyle(ButtonStyle.Success)
        );
        
        const messagePayload = {content, components: [row]};
        const message = await welcomeChannel.send(messagePayload);
        await interaction.reply({ content: `Verification message created successfully in ${welcomeChannel}` });
    }
};