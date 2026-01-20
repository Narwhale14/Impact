const { EmbedBuilder } = require('discord.js');
const { getOpenApplication, deleteOpenApplication } = require('../../utils/DBManagers/openApplicationsManager.js');
const embeds = require('../embeds.js');

module.exports = {
    customId: 'deny_request_button',
    async execute(interaction) {
        const logsMessageId = interaction.message.id;
        const app = await getOpenApplication(logsMessageId);
        if(!app) return interaction.reply({ embeds: [embeds.errorEmbed('Application not found!')], flags: 64 });

        try {
            await deleteOpenApplication(logsMessageId);

            const updateEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setTitle(`❌ Denied`)
                .setColor(embeds.ERROR_COLOR);

            await interaction.message.edit({ embeds: [updateEmbed], components: [] })
            await interaction.reply({ embeds: [embeds.successEmbed('Denied user.', interaction.guild.members.me.displayHexColor, 'DENIED')] });

            const user = await interaction.client.users.fetch(app.discord_user_id);
            
            try {
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Guild Application Result')
                            .setDescription('❌ Your application was denied.\nYou most likely did not meet the join requirements.\nIf missed in the guild info channel, run this command:')
                            .addFields(
                                { name: 'View rank requirements', value: '/role reqs'})
                            .setColor(embeds.ERROR_COLOR)
                            .setTimestamp()
                    ]
                });
            } catch {}
        } catch (err) {
            console.error(err);
            await interaction.reply({ embeds: [embeds.errorEmbed(err.message)], flags: 64 });
        }
    }
}