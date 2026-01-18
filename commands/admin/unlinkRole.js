const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateGuildData, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds/embeds.js');

/**
 * @command - /unlinkrole
 * unlinks an in-game rank in the hypixel guild to a role in the discord
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlinkrole')
        .setDescription('Unlinks in-game guild rank with discord role')
        .addStringOption(option => option.setName('hypixel_rank').setDescription('Guild rank').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.hypixel_guild_id) return interaction.editReply({ embeds: [embeds.guildNotLinked()] });

            const hypixelRank = interaction.options.getString('hypixel_rank').trim().toUpperCase();

            const roleMappings = guildDBData?.role_mappings || {};
            if(!roleMappings[hypixelRank])
                return interaction.reply({ embeds: [embeds.errorEmbed(`The guild rank **${hypixelRank}** is not current linked to any discord role!`)] });
            delete roleMappings[hypixelRank];
            await updateGuildData(interaction.guild, { roleMappings });

            await interaction.reply({ embeds: [embeds.successEmbed(`Unlinked **${hypixelRank}** from it's discord role successfully!`, interaction.guild.members.me.displayHexColor)], allowedMentions: { roles: [] } });
        } catch(err) {
            console.error("Failed to pull/update guild data: ", err);
            await interaction.reply({ embeds: [embeds.errorEmbed("An error occurred while unlinking roles.")] });
        }
    }
}