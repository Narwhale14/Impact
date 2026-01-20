const { EmbedBuilder, userMention } = require('discord.js');
const { getGuildData } = require('../../utils/DBManagers/guildDataManager.js');
const { getOpenApplication, deleteOpenApplication } = require('../../utils/DBManagers/openApplicationsManager.js');
const embeds = require('../embeds.js');

module.exports = {
    customId: 'accept_request_button',
    async execute(interaction) {
        const logsMessageId = interaction.message.id;
        const app = await getOpenApplication(logsMessageId);
        if(!app) return interaction.reply({ embeds: [embeds.errorEmbed('Application not found!')], flags: 64 });

        const guildDBData = await getGuildData(interaction.guild);
        const roleId = guildDBData?.guild_member_role;
        if(!roleId) return interaction.reply({ embeds: [embeds.errorEmbed(`Unable to locate guild member role.\nPlease ping a staff for help.`)], flags: 64 });

        try {
            const member = await interaction.guild.members.fetch(app.discord_user_id);
            if(!member) throw new Error('Applicant is not in this server.');

            await member.roles.add(roleId);
            await deleteOpenApplication(logsMessageId);

            const updateEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setTitle(`✅ Accepted`)
                .setColor(embeds.SUCCESS_COLOR);

            await interaction.message.edit({ embeds: [updateEmbed], components: [] })
            await interaction.reply({ embeds: [embeds.successEmbed('Accepted user into the guild!', interaction.guild.members.me.displayHexColor)] });

            const user = await interaction.client.users.fetch(app.discord_user_id);

            try {
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Guild Application Result')
                            .setDescription('✅ Your application was accepted!\nPlease consider the following:')
                            .addFields(
                                { name: 'Link in-game profile with:', value: '`/link <profile name>`'},
                                { name: 'Update role based on guild rank:', value: '`/role update`'},
                                { name: 'View rank requirements', value: '/role reqs'})
                            .setColor(embeds.SUCCESS_COLOR)
                            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
                            .setTimestamp()
                    ]
                });
            } catch {}
        } catch (err) {
            await interaction.reply({ embeds: [embeds.errorEmbed(err.message)], flags: 64 });
        }
    }
}