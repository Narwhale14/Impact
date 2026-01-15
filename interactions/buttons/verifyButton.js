const { getData } = require('../../utils/jsonStorage.js');

module.exports = {
    customId: 'verify_button',
    async execute(interaction) {
        const role = getData('verificationRole');
        if (!role.id) return interaction.reply({ content: `Unable to locate verification role.` });

        try {
            await interaction.member.roles.add(role.id);
            await interaction.reply({ content: 'You have been verified!', flags: 64 });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Failed to assign role.', flags: 64 });
        }
    }
}