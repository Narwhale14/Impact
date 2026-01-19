const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /editverifymessage
 * directly edits a verification message in a specific channel by ID and channel
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription('Manage verification messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('create')
            .setDescription('Create a verification message')
            .addStringOption(option => option.setName('message').setDescription('Verification message content').setRequired(true))
            .addChannelOption(option => option.setName('channel').setDescription('Channel to send the message in').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('edit')
            .setDescription('Edits a verification message')
            .addStringOption(option => option.setName('message').setDescription('Verification message content').setRequired(true))
            .addChannelOption(option => option.setName('channel').setDescription('Channel to send the message in').setRequired(true))
            .addStringOption(option => option.setName('id').setDescription('Verification message ID').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('delete')
            .setDescription('Deletes a verification message')
            .addChannelOption(option => option.setName('channel').setDescription('Channel to send the message in').setRequired(true))
            .addStringOption(option => option.setName('id').setDescription('Verification message ID').setRequired(true))),
        adminOnly: true,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel');
        const messageId = interaction.options.getString('id')

        try {
            const guildDBData = await getGuildData(interaction.guild.id);

            // create subcommand
            if(subcommand === 'create') {
                if(!guildDBData?.verification_role) return interaction.reply({ embeds: [embeds.errorEmbed('Verification role does not exist!')] });
                if(!channel || !channel.isTextBased()) return interaction.reply({ embeds: [embeds.errorEmbed('Invalid channel!')] });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('verify_button').setLabel('Verify').setStyle(ButtonStyle.Success)
                );
                
                const messagePayload = {content: message, components: [row]};
                await channel.send(messagePayload);
                await interaction.reply({ embeds: [embeds.successEmbed(`Verification message created successfully in ${channel}`, interaction.guild.members.me.displayHexColor)] });
            }

            // edit subcommand
            if(subcommand == 'edit') {
                if (!messageId) return interaction.reply({ embeds: [embeds.errorEmbed('Verification message does not exist!')] });

                const targetMessage = await channel.messages.fetch(messageId);
                await targetMessage.edit({ content: message, components: message.components });
                await interaction.reply({ embeds: [embeds.successEmbed('Verification message edited!', interaction.guild.members.me.displayHexColor)] });
            }

            // delete subcommand
            if(subcommand == 'delete') {
                if (!messageId) return interaction.reply({ embeds: [embeds.errorEmbed('Verification message does not exist!')] });

                const targetMessage = await channel.messages.fetch(messageId);
                await targetMessage.delete();
                await interaction.reply({ embeds: [embeds.successEmbed('Verification message deleted!', interaction.guild.members.me.displayHexColor)] });
            }
        } catch(err) {
            console.error(err);
            await interaction.reply({ embeds: [embeds.errorEmbed('Failed to edit verification message.')] });
        }
    }
};