const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getGuildData } = require('../../utils/DBManagers/guildDataManager.js');
const { getProfileSkyblockLevelByUUID, isPlayerInGuild, isPlayerInGuild } = require('../../utils/APIManagers/hypixelAPIManager.js');
const { getUUIDFromName } = require('../../utils/APIManagers/minecraftAPIManager.js');
const { updateOpenApplications } = require('../../utils/DBManagers/openApplicationsManager.js');
const embeds = require('../embeds.js');

module.exports = {
    customId: 'apply_modal',
    async execute(interaction) {
        const guildDBData = await getGuildData(interaction.guild);
        const logsChannel = interaction.guild.channels.cache.get(guildDBData?.logs_channel_id);
        if(!logsChannel || !logsChannel.isTextBased())
            return interaction.reply({ embeds: [embeds.errorEmbed(`Unable to notify staff about your application\nPlease ping a staff for help.`)], flags: 64 });

        const name = interaction.fields.getTextInputValue('minecraft_user_input');
        const profileName = interaction.fields.getTextInputValue('skyblock_profile_name');

        const mainEmbed = new EmbedBuilder()
            .setTitle(`New Application!`)
            .setDescription(`Application for <@${interaction.user.id}>`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor(embeds.WARNING_COLOR)
            .setTimestamp();

        try {
            const uuid = await getUUIDFromName(name);
            const inGuild = await isPlayerInGuild(uuid);
            if(inGuild) return interaction.reply({ embeds: [embeds.errorEmbed('You are already in the guild!')], flags: 64 });

            const profileData = await getProfileSkyblockLevelByUUID(uuid, profileName);
            mainEmbed.addFields(
                { name: 'Minecraft Username', value: `**${name}**` },
                { name: 'Skyblock Profile', value: `**${profileData.profile}**` },
                { name: 'Skyblock Level', value: `**${profileData.level}**` }
            )
        } catch(err) {
            console.log('Error fetching player data from apply_modal: ', err);
            interaction.reply({ embeds: [embeds.errorEmbed(`Unable to fetch your player data!\nPlease make sure you input the correct data.`)], flags: 64 });
        }

        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`accept_request_button`).setLabel('Accept').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`deny_request_button`).setLabel('Deny').setStyle(ButtonStyle.Danger)
        );

        try {
            const appMessage = await logsChannel.send({ 
                content: `<@${guildDBData.application_ping}>`,
                embeds: [mainEmbed], 
                components: [buttonRow],
                allowedMentions: { roles: [] }
            });

            await updateOpenApplications({
                guildDataId: guildDBData.id,
                logsMessageId: appMessage.id,
                discordUserId: interaction.user.id,
                minecraftName: name,
                profileName: profileName
            });

            return interaction.reply({ embeds: [embeds.successEmbed('Guild application submitted!\nA staff member will review shortly.', interaction.guild.members.me.displayHexColor, 'SUBMITTED')], flags: 64 });
        } catch (err) {
            await logsChannel.send({ embeds: [embeds.errorEmbed(`Failed to apply user <@${interaction.user.id}>.`, err.message)] });
            return interaction.reply({ embeds: [embeds.errorEmbed('Failed to apply.\nPlease ping staff for help.')], flags: 64 });
        }
    }
}