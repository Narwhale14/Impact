const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, InteractionResponse } = require('discord.js');
const { getGuildData, updateGuildColumn } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /editverifymessage
 * directly edits a verification message in a specific channel by ID and channel
 * can also set/clear verification role
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
            .addStringOption(option => option.setName('id').setDescription('Verification message ID').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('clearrole')
            .setDescription('Clears verification role'))
        .addSubcommand(sub => sub
            .setName('setrole')
            .setDescription('Sets role to use for verification')
            .addRoleOption(option => option.setName('role').setDescription('Role of choice').setRequired(true))),
        adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        const guildDBData = await getGuildData(interaction.guild);

        // create subcommand
        if(subcommand === 'create') {
            const message = interaction.options.getString('message');
            const channel = interaction.options.getChannel('channel');
            if(!channel || !channel.isTextBased()) return interaction.editReply({ embeds: [embeds.errorEmbed('Please select a **text** channel')] });
            if(!guildDBData?.verification_role) return interaction.editReply({ embeds: [embeds.errorEmbed('Verification role does not exist!')] });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_button').setLabel('Verify').setStyle(ButtonStyle.Success)
            );
            
            const messagePayload = {content: message, components: [row]};
            try {
                await channel.send(messagePayload);
                await interaction.editReply({ embeds: [embeds.successEmbed(`Verification message created successfully in ${channel}`, interaction.guild.members.me.displayHexColor)] });
            } catch(err) {
                console.error("Failed running '/verification create': ", err);
                return interaction.editReply({ embeds: [embeds.errorEmbed('Unable to send message in this channel!')] });
            }
        }

        // edit subcommand
        if(subcommand == 'edit') {
            const message = interaction.options.getString('message');
            const messageId = interaction.options.getString('id');
            const channel = interaction.options.getChannel('channel');
            if(!channel || !channel.isTextBased()) return interaction.editReply({ embeds: [embeds.errorEmbed('Please select a **text** channel')] });

            try {
                const targetMessage = await channel.messages.fetch(messageId);
                await targetMessage.edit({ content: message, components: targetMessage.components });
            } catch {
                console.error("Failed running '/verification edit': ", err);
                return interaction.editReply({ embeds: [embeds.errorEmbed('Message not found in this channel')] });
            }

            await interaction.editReply({ embeds: [embeds.successEmbed('Verification message edited!', interaction.guild.members.me.displayHexColor)] });
        }

        // delete subcommand
        if(subcommand == 'delete') {
            const messageId = interaction.options.getString('id');
            const channel = interaction.options.getChannel('channel');
            if(!channel || !channel.isTextBased()) return interaction.editReply({ embeds: [embeds.errorEmbed('Please select a **text** channel')] });

            try {
                const targetMessage = await channel.messages.fetch(messageId);
                await targetMessage.delete();
            } catch {
                console.error("Failed running '/verification delete': ", err);
                return interaction.editReply({ embeds: [embeds.errorEmbed('Message not found in this channel.')] });
            }

            await interaction.editReply({ embeds: [embeds.successEmbed('Verification message deleted!', interaction.guild.members.me.displayHexColor)] });
        }

        // setrole subcommand
        if(subcommand == 'setrole') {
            if(guildDBData?.verification_role) return interaction.reply({ embeds: [embeds.errorEmbed(`The verification role is already set to <@&${guildDBData.verification_role}>.`)], allowedMentions: { roles: [] }});
            const verificationRole = interaction.options.getRole('role');
            if(!verificationRole) return interaction.editReply({ embeds: [embeds.errorEmbed('Invalid role!')] });

            try {
                await updateGuildColumn(interaction.guild, 'verification_role', verificationRole.id);
                await interaction.editReply({ embeds: [embeds.successEmbed(`Verification role set successfully to <@&${verificationRole.id}>!`, interaction.guild.members.me.displayHexColor)], allowedMentions: { roles: [] } });
            } catch(err) {
                console.error("Failed running '/verification setrole': ", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed("An error occurred while setting verification role.")] });
            } 
        }

        // clearrole subcommand
        if(subcommand == 'clearrole') {
            if(!guildDBData?.verification_role) return interaction.editReply({ embeds: [embeds.errorEmbed('Verification role does not exist!')] });

            try {
                await updateGuildColumn(interaction.guild, 'verification_role', null);
                await interaction.editReply({ embeds: [embeds.successEmbed('Set verification role cleared.', interaction.guild.members.me.displayHexColor)] });
            } catch(err) {
                console.error("Failed running '/verification clearrole': ", err);
                await interaction.editReply({ embeds: [embeds.errorEmbed("An error occurred while clearing verification role.")] });
            } 
        }
    }
};