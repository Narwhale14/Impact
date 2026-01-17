const { SlashCommandBuilder } = require('discord.js');
const { getGuildData } = require('../utils/guildDataManager.js');

/**
 * @command - /clearrole
 * clears a user of their discord role based on guild rank
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearrole')
        .setDescription('Clears discord role based on guild rank'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData) return interaction.editReply({ content: "This server is not linked to a Hypixel guild."});

            const roleMappings = guildDBData.role_mappings || {};
            const memberDiscord = interaction.guild.members.cache.get(interaction.user.id);
            let cleared = false;
            for(const rankObj of Object.values(roleMappings)) {
                const rid = rankObj.discord_role_id;
                if(rid && memberDiscord.roles.cache.has(rid)) {
                    await memberDiscord.roles.remove(rid);
                    cleared = true;
                }
            }

            if(cleared) 
                return interaction.editReply({ content: `Successfully cleared all rank roles.\nTo sync in-game rank again, run \`/updaterole\`` });
            else 
                return interaction.editReply({ content: 'No rank to clear!'})
        } catch(err) {
            console.error("Error assinging guild role: ", err);
            return interaction.editReply({ content: 'An error occured while syncing your role.' });
        }
    }
}