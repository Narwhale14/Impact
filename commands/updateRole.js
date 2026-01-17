const { SlashCommandBuilder } = require('discord.js');
const { getGuildData } = require('../utils/guildDataManager.js');
const { getLinkedPlayer } = require('../utils/linkedPlayersManager.js');
const { getMemberInGuildByPlayerUUID } = require('../utils/hypixelAPIManager.js');

/**
 * @command - /updaterole
 * syncs a user to their in game rank
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('updaterole')
        .setDescription('Syncs guild rank and discord role'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData) return interaction.editReply({ content: "This server is not linked to a Hypixel guild."});

            // server guild membership
            const linkedPlayer = await getLinkedPlayer(interaction.user.id);
            if(!linkedPlayer || linkedPlayer.guild_data_id !== guildDBData.id)
                return interaction.editReply({ content: "You are not linked to the guild for this server.\nIf you believe you are in the guild, run `/link <minecraft username>`"});

            const member = await getMemberInGuildByPlayerUUID(linkedPlayer.hypixel_uuid);
            if(!member || member.guild_id !== guildDBData.hypixel_guild_id)
                return interaction.editReply({ content: "You are not currently in this guild. "});

            const roleMappings = guildDBData.role_mappings;
            const roleData = roleMappings[member.rank.toUpperCase()]; // gets server role id
            if(!roleData?.discord_role_id) return interaction.editReply({ content: `No Discord role mapped for your rank **${member.rank.toUpperCase()}**.`});

            // actually updating roles
            const roleId = roleData.discord_role_id;
            const memberDiscord = interaction.guild.members.cache.get(interaction.user.id);
            for(const rankObj of Object.values(roleMappings)) {
                const rid = rankObj.discord_role_id;
                if(rid && memberDiscord.roles.cache.has(rid)) await memberDiscord.roles.remove(rid);
            }

            await memberDiscord.roles.add(roleId);
            return interaction.editReply({ content: `Successfully updated role to <@&${roleId}> based on guild rank **${member.rank.toUpperCase()}**!`, allowedMentions: { roles: [] }});
        } catch(err) {
            console.error("Error assinging guild role: ", err);
            return interaction.editReply({ content: 'An error occured while updating your role.' });
        }
    }
}