const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuildData } = require('../../utils/guildDataManager.js');

/**
 * @command - /clearroleall
 * clears all users of their discord role based on guild rank
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearroleall')
        .setDescription('Clears discord role based on guild rank from ALL users')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
        dangerous: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData) return interaction.editReply({ content: "This server is not linked to a Hypixel guild."});

            const roleMappings = guildDBData.role_mappings || {};
            const verificationRoleId = guildDBData.verification_role;
            if(!verificationRoleId) return interaction.deferReply({ content: "No verification role configured." });

            await interaction.guild.members.fetch();
            let affectedMembers = 0;
            let removedRoles = 0;

            for(const member of interaction.guild.members.cache.values()) {
                if(!member.roles.cache.has(verificationRoleId)) continue;
                let memberCleared = false;

                for(const rankObj of Object.values(roleMappings)) {
                    const rid = rankObj.discord_role_id;
                    if(rid && member.roles.cache.has(rid)) {
                        await member.roles.remove(rid);
                        memberCleared = true;
                        removedRoles++;
                    }
                }

                if(memberCleared) affectedMembers++;
            }

            return interaction.editReply({ content: `Cleared rank roles from **${affectedMembers}** verified users.\nTotal roles removed: **${removedRoles}**`});
        } catch(err) {
            console.error("Error clearing roles for all users: ", err);
            return interaction.editReply({ content: 'An error occured while clearing roles for all users.' });
        }
    }
}