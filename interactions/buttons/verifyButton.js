const { getGuildData } = require('../../utils/guildDataManager.js');

module.exports = {
    customId: 'verify_button',
    async execute(interaction) {
        const guildData = await getGuildData(interaction.guild.id);
        const roleId = guildData?.verification_role;
        // in case of database error
        if (!roleId) return interaction.reply({ content: `Unable to locate verification role.\nPinging for help: <@330792317701193728>` });

        try {
            await interaction.member.roles.add(roleId);
            await interaction.reply({ content: 'You have been verified!', flags: 64 });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Failed to assign role.', flags: 64 });
        }
    }
}