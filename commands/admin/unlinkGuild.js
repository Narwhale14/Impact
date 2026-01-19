const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { updateGuildColumn, getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds.js');

/**
 * @command - /unlinkguild
 * unlinks in game hypixel guild to discord server
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlinkguild')
        .setDescription('Unlinks discord server with hypixel guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        adminOnly: true,
        dangerous: true,
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData?.hypixel_guild_id) return interaction.editReply({ embeds: [embeds.guildNotLinked()] });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`confirm_unlink:${interaction.user.id}`).setLabel('Confirm').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`cancel_unlink:${interaction.user.id}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
            )

            const mainEmbed = new EmbedBuilder()
                .setTitle('⚠️ WARNING')
                .setDescription('Are you sure you want to unlink the guild?\n**You will have to relink in-game ranks.**')
                .setColor(embeds.WARNING_COLOR)
                .setTimestamp();
            await interaction.editReply({ embeds: [mainEmbed], components: [row] });

            const filter = i => i.user.id === interaction.user.id
            const buttonInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null);

            if(!buttonInteraction) {
                row.components.forEach(b => b.setDisabled(true));
                mainEmbed.setDescription('Unlink timed out').setColor(embeds.ERROR_COLOR);
                return interaction.editReply({ embeds: [mainEmbed], components: [row] });
            }

            // atp button interaction is stored, disable buttons
            row.components.forEach(b => b.setDisabled(true));

            if(buttonInteraction.customId === `cancel_unlink:${interaction.user.id}`) {
                mainEmbed.setTitle('Cancelled').setDescription('Unlink cleared cancelled.').setColor(interaction.guild.members.me.displayHexColor)
                return buttonInteraction.update({ embeds: [mainEmbed], components: [] });
            }

            if(buttonInteraction.customId === `confirm_unlink:${interaction.user.id}`) {
                // run in parallel 
                await Promise.all([
                    updateGuildColumn(interaction.guild.id, 'hypixel_guild_id', null),
                    updateGuildColumn(interaction.guild.id, 'role_mappings', null)
                ]);

                mainEmbed.setTitle('Success').setDescription(`Successfully unlinked any guild to this server!\nCleared linked roles!`).setColor(interaction.guild.members.me.displayHexColor);
                await buttonInteraction.update({ embeds: [mainEmbed], components: [] });
            }

        } catch(err) {
            console.error("Error fetching guild: ", err);
            await interaction.followUp({ embeds: [embeds.errorEmbed("An error occured while fetching guild")], components: [] });
        }
    }
}