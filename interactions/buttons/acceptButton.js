const { getGuildData } = require('../../utils/DBManagers/guildDataManager.js');
const embeds = require('../embeds.js');

module.exports = {
    customId: 'accept_button',
    async execute(interaction) {
        const guildDBData = await getGuildData(interaction.guild);
        const roleId = guildDBData?.guild_member_role;
        if(!roleId) return interaction.reply({ embeds: [embeds.errorEmbed(`Unable to locate guild member role.\nPlease ping a staff for help.`)], flags: 64 });

        try {
            await interaction.member.roles.add(roleId);
            await interaction.reply({ embeds: [embeds.successEmbed('Accepted user into the guild!', interaction.guild.members.me.displayHexColor)] });
        } catch (err) {
            console.error(err);
            await interaction.reply({ embeds: [embeds.errorEmbed('Failed to assign role.')], flags: 64 });
        }
    }
}