const { SlashCommandBuilder } = require('discord.js');
const { getGuildData } = require('../utils/guildDataManager.js');
const { deleteLinkedPlayer, getLinkedPlayer } = require('../utils/linkedPlayersManager.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlinks your Discord from your Minecraft Hypixel accounts')
        .addUserOption(option => option.setName('user').setDescription('Admin only: unlink another user').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const targetUser = interaction.options.getUser('user') ?? interaction.user;
            const guildData = await getGuildData(interaction.guild.id);
            const adminRoleId = guildData?.admin_role;

            // test if user is admin
            let userIsAdmin = false;
            if(targetUser?.id !== interaction.user.id) {
                const member = await interaction.guild.members.fetch(interaction.user.id);
                userIsAdmin = (adminRoleId && member.roles.cache.has(adminRoleId)) || member.permissions.has('Administrator');
                if(!userIsAdmin) return interaction.editReply("You do not have permission to unlink another user.");
            }

            const existingLink = await getLinkedPlayer(targetUser.id);
            if(!existingLink) return interaction.editReply(`**${targetUser.username}** is not linked to any Hypixel Account.`);

            // delete from db
            await deleteLinkedPlayer(targetUser.id);

            const success = (userIsAdmin && targetUser.id !== interaction.user.id)
                ? `Successfully unlinked **${existingLink.hypixel_name}** from **${targetUser.username}**'s Discord account.`
                : `Successfully unlinked **${existingLink.hypixel_name}** from your Discord account.`;
            await interaction.editReply(success);
        } catch(err) {
            console.error("Error unlinking player: ", err);
            await interaction.editReply("An error occured while unlinking the account.");
        }
    }
}