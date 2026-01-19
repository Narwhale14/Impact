const { SlashCommandBuilder } = require('discord.js');
const { getGuildData } = require('../../utils/guildDataManager.js');
const { getLinkedPlayer } = require('../../utils/linkedPlayersManager.js');
const { getProfileSkyblockLevelByUUID, getMemberInGuildByPlayerUUID } = require('../../utils/hypixelAPIManager.js');
const { getEligibleRoleId, removeMappedRoles } = require('../../utils/roleHelpers.js');
const embeds = require('../../interactions/embeds.js');

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
            if(!guildDBData?.hypixel_guild_id) return interaction.editReply({ embeds: [embeds.guildNotLinked()] });

            const linkedPlayer = await getLinkedPlayer(interaction.user.id);
            if(!linkedPlayer || linkedPlayer.guild_data_id !== guildDBData.id)
                return interaction.editReply({ embeds: [embeds.errorEmbed("You are not linked to the guild for this server.\nIf you believe you are in the guild, run `/link <minecraft username>`")] });
            
            // player data
            const profileName = interaction.options.getString('profile');
            const { level, profile } = await getProfileSkyblockLevelByUUID(linkedPlayer.hypixel_uuid, profileName);
            const member = await getMemberInGuildByPlayerUUID(linkedPlayer.hypixel_uuid);
            if(!member || member.guild_id !== guildDBData.hypixel_guild_id)
                return interaction.editReply({ embeds: [embeds.errorEmbed("You are not currently in this guild.")] });
            const inGameRank = member.rank.toUpperCase();

            /** available data from API:
             *      player profile level
             *      player profile name
             *      player uuid
             *      player guild rank
             *      guild id
             *      guild name
             */

            const eligibleRole = getEligibleRoleId(guildDBData.role_mappings, level);
            if(!eligibleRole) return interaction.editReply({ embeds: [embeds.errorEmbed(`No Discord role available for profile **${profile}** (level: ${level})`)] });

            const memberDiscord = await interaction.guild.members.fetch(interaction.user.id);
            await removeMappedRoles(memberDiscord, guildDBData.role_mappings);
            await memberDiscord.roles.add(eligibleRole.discord_role_id);
            
            let success = `Successfully updated role to <@&${eligibleRole.discord_role_id}> based on Skyblock profile **${profile}** (level: ${level})!`;
            if(inGameRank !== eligibleRole.rank)
                success += `\n\nCurrent in-game guild rank is **${inGameRank}**, expect to be changed to **${eligibleRole.rank}** soon!`;

            return interaction.editReply({ embeds: [embeds.successEmbed(success, interaction.guild.members.me.displayHexColor)], allowedMentions: { roles: [] } });
        } catch(err) {
            console.error("Error updating role: ", err);

            if(err.message.includes("Profile") && err.message.includes("not found")) {
                return interaction.editReply({ embeds: [embeds.errorEmbed(err.message)] });
            }

            return interaction.editReply({ embeds: [embeds.errorEmbed('An error occured while updating your role.')] });
        }
    }
}