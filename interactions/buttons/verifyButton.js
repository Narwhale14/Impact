const { getGuildData } = require('../../utils/DBManagers/guildDataManager.js');
const embeds = require('../embeds.js');

module.exports = {
    customId: 'verify_button',
    async execute(interaction) {
        const guildDBData = await getGuildData(interaction.guild);
        const roleId = guildDBData?.verification_role;
        if(!roleId) return interaction.reply({ embeds: [embeds.errorEmbed(`Unable to locate verification role.\nPlease ping a staff for help.`)], flags: 64 });

        try {
            await interaction.member.roles.add(roleId);
            await interaction.reply({ embeds: [embeds.successEmbed('You have been verified!', interaction.guild.members.me.displayHexColor)], flags: 64 });
        } catch (err) {
            console.error(err);
            await interaction.reply({ embeds: [embeds.errorEmbed('Failed to assign role.\nPlease ping staff for help')], flags: 64 });
        }
    }
}