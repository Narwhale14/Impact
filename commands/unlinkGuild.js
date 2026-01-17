const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../utils/guildDataManager.js');

/**
 * @command - /unlinkguild
 * unlinks in game hypixel guild to discord server
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlinkguild')
        .setDescription('Unlinks discord server with hypixel guild'),
    adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.hypixel_guild_id) return interaction.editReply('This server is not linked to a Hypixel guild.');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('confirm_unlink').setLabel('Confirm').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('cancel_unlink').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
            )

            await interaction.editReply({ content: 'Are you sure you want to unlink this guild?\n**This will also delete the role mappings.**', components: [row] });
            const filter = i => i.user.id === interaction.user.id;

            const buttonInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 30000}).catch(() => null);
            if(!buttonInteraction) interaction.editReply({ content: 'Unlink timedout.', components: [] });

            if(buttonInteraction.customId === 'cancel_unlink') return buttonInteraction.update({ content: 'Unlink cancelled.', components: [] });

            // run in parallel
            await Promise.all([
                updateGuildColumn(interaction.guild.id, 'hypixel_guild_id', null),
                updateGuildColumn(interaction.guild.id, 'role_mappings', null)
            ]);

            await interaction.editReply({ content: `Successfully unlinked any guild to this server!\nCleared linked roles!`, components: [] });
        } catch(err) {
            console.error("Error fetching guild: ", err);
            await interaction.editReply({ content: "An error occured while fetching guild", components: [] });
        }
    }
}