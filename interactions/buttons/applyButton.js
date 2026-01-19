const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'apply_button',
    async execute(interaction) {
        const nameInput = new TextInputBuilder({
            customId: 'minecraft_user_input',
            style: TextInputStyle.Short,
            label: 'Your Minecraft Username',
            placeholder: 'Enter your Minecraft username',
            required: true
        });

        const profileInput = new TextInputBuilder({
            customId: 'skyblock_profile_name',
            style: TextInputStyle.Short,
            label: 'Your Skyblock Profile',
            placeholder: 'Enter your Skyblock profile (e.g. "cucumber")',
            required: true
        });

        const row1 = new ActionRowBuilder({ components: [nameInput] });
        const row2 = new ActionRowBuilder({ components: [profileInput] });

        const modal = new ModalBuilder({
            custom_id: 'apply_modal',
            title: 'Submit Your Application',
            components: [row1, row2]
        });

        await interaction.showModal(modal);
    }
}