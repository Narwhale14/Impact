const { SlashCommandBuilder } = require('discord.js');
const { deleteLinkedPlayer, getLinkedPlayer } = require('../../utils/linkedPlayersManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlinks your Hypixel account to your Discord'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const targetUser = interaction.options.getUser('user') ?? interaction.user;

            const existingLink = await getLinkedPlayer(targetUser.id);
            if(!existingLink) return interaction.editReply(`**${targetUser.username}** is not linked to any Hypixel Account.`);

            // delete from db
            await deleteLinkedPlayer(targetUser.id);
            await interaction.editReply(`Successfully unlinked **${existingLink.hypixel_name}** from your Discord account.`);
        } catch(err) {
            console.error("Error unlinking player: ", err);
            await interaction.editReply("An error occured while unlinking the account.");
        }
    }
}