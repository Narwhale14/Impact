const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /rolereqs
 * displays requirements for roles
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolereqs')
        .setDescription('Requirements for server ranks'),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild);
            if(!guildDBData?.hypixel_guild_id) return interaction.editReply({ embeds: [embeds.guildNotLinked()] });

            const roleMappings = guildDBData.role_mappings;
            const sortedRoles = Object.entries(roleMappings)
                .sort((a, b) => b[1].level_requirement - a[1].level_requirement);

            let description = '';
            for(const [rank, data] of sortedRoles) {
                description += 
                    `<@&${data.discord_role_id}> - **${rank}**` +
                    `\n↳ Skyblock Level **${data.level_requirement}**\n\n`;
            }

            const embed = new EmbedBuilder()
                .setTitle('Guild Role Requirements')
                .setColor(interaction.guild.members.me.displayHexColor)
                .setDescription(description)
                .setFooter({ text: `Requirements are based on Skyblock Profile level` })

            return interaction.editReply({ embeds: [embed], allowedMentions: { roles: [] } });
        } catch(err) {
            console.error("Error fetching role_mappings: ", err);
            return interaction.editReply({ embeds: [embeds.errorEmbed('An error occured while fetching role requirements.')] });
        }
    }
}