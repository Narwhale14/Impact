const { SlashCommandBuilder } = require('discord.js');
const { getGuildData } = require('../utils/guildDataManager.js');
const { getLinkedPlayer } = require('../utils/linkedPlayersManager.js');
const { getProfileSkyblockLevelByUUID } = require('../utils/hypixelAPIManager.js');
const { getEligibleRoleId, removeMappedRoles } = require('../utils/roleHelpers.js');

/**
 * @command - /updaterole
 * updates a user to their in game rank
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('updaterole')
        .setDescription('Updates guild rank and discord role')
        .addStringOption(option => option.setName('profile').setDescription('Option Skyblock profile name (e.g. Cucumber)').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData) return interaction.editReply({ content: "This server is not linked to a Hypixel guild."});

            // server guild membership
            const linkedPlayer = await getLinkedPlayer(interaction.user.id);
            if(!linkedPlayer || linkedPlayer.guild_data_id !== guildDBData.id)
                return interaction.editReply({ content: "You are not linked to the guild for this server.\nIf you believe you are in the guild, run `/link <minecraft username>`"});

            const profileName = interaction.options.getString('profile');
            const { level, profile } = await getProfileSkyblockLevelByUUID(linkedPlayer.hypixel_uuid, profileName);

            const roleId = getEligibleRoleId(guildDBData.role_mappings, level);
            if(!roleId) return interaction.editReply(`No Discord role available for profile **${profile}** (level: ${level})`);

            const memberDiscord = await interaction.guild.members.fetch(interaction.user.id);
            await removeMappedRoles(memberDiscord, guildDBData.role_mappings);
            await memberDiscord.roles.add(roleId);

            return interaction.editReply({ content: `Successfully updated role to <@&${roleId}> based on profile **${profile}**!`, allowedMentions: { roles: [] }});
        } catch(err) {
            console.error("Error updating role: ", err);
            return interaction.editReply({ content: 'An error occured while updating your role.' });
        }
    }
}