const { SlashCommandBuilder } = require('discord.js');
const { getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /clearrole
 * clears a user of their discord role based on guild rank
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearrole')
        .setDescription('Clears guild rank role'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.hypixel_guild_id) return interaction.editReply({ embeds: [embeds.guildNotLinked()] });

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

            let success = '';
            if(cleared) 
                success = `Successfully cleared all rank roles.\nTo sync in-game rank again, run \`/updaterole\``;
            else 
                success = 'No rank to clear!';

            return interaction.editReply({ embeds: [embeds.successEmbed(success, interaction.guild.members.me.displayHexColor)] });
        } catch(err) {
            console.error("Error assinging guild role: ", err);
            return interaction.editReply({ embeds: [embeds.catchErrorEmbed('An error occured while syncing your role.')] });
        }
    }
}