const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuildData, updateGuildColumn } = require('../../utils/guildDataManager.js');
const { getGuildByName } = require('../../utils/hypixelAPIManager.js');

/**
 * @command - /linkguild
 * links in game hypixel guild to discord server
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('linkguild')
        .setDescription('Links discord server with hypixel guild')
        .addStringOption(option => option.setName('guild').setDescription('Guild of choice').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(guildDBData?.hypixel_guild_id) return interaction.editReply('This servier is already linked to a Hypixel guild!');

            // api call
            const guildName = interaction.options.getString('guild');
            const hypixelGuild = await getGuildByName(guildName);
            if(!hypixelGuild) return interaction.editReply(`Guild **${guildName}** not found on Hypixel.`)

            await updateGuildColumn(interaction.guild, 'hypixel_guild_id', hypixelGuild._id);

            await interaction.editReply(`Successfully linked guild **${guildName}** to this server!`);
        } catch(err) {
            console.error("Error fetching guild: ", err);
            await interaction.editReply("An error occured while fetching guild");
        }
    }
}