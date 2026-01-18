const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds/embeds.js');

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
        try {
            const content = interaction.options.getString('message');
            const welcomeChannel = interaction.options.getChannel('channel');

            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.verification_role) return interaction.deferReply({ embeds: [embeds.errorEmbed('Verification role does not exist!')] });

            if(!welcomeChannel || !welcomeChannel.isTextBased())
                return interaction.reply({ embeds: [embeds.errorEmbed('Invalid channel!')] });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_button').setLabel('Verify').setStyle(ButtonStyle.Success)
            );
            
            const messagePayload = {content, components: [row]};
            await welcomeChannel.send(messagePayload);
            await interaction.reply({ embeds: [embeds.successEmbed(`Verification message created successfully in ${welcomeChannel}`, interaction.guild.members.me.displayHexColor)] });
        } catch(err) {
            console.error(err);
            await interaction.editReply({embeds: [embeds.errorEmbed("An error occured while creating verification message!")] });
        }
    }
};