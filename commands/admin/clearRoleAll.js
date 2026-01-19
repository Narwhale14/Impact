const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getGuildData } = require('../../utils/guildDataManager.js');
const embeds = require('../../interactions/embeds.js');

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
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`confirm_clear:${interaction.user.id}`).setLabel('Confirm').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`cancel_clear:${interaction.user.id}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
            );

            const mainEmbed = new EmbedBuilder()
                .setTitle('⚠️ WARNING')
                .setDescription('Are you sure you want to clear all rank roles from members?\n**This is irreversible.**')
                .setColor(embeds.WARNING_COLOR)
                .setTimestamp();
            await interaction.editReply({ embeds: [mainEmbed], components: [row] });

            const filter = i => i.user.id === interaction.user.id
            const buttonInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null);

            if(!buttonInteraction) {
                row.components.forEach(b => b.setDisabled(true));
                mainEmbed.setDescription('Role clear timed out.').setColor(embeds.ERROR_COLOR);
                return interaction.editReply({ embeds: [mainEmbed], components: [row] });
            }

            // disable after getting interaction
            row.components.forEach(b => b.setDisabled(true));

            if(buttonInteraction.customId === `cancel_clear:${interaction.user.id}`) {
                mainEmbed.setTitle('Cancelled').setDescription('Role cleared cancelled.').setColor(interaction.guild.members.me.displayHexColor)
                return buttonInteraction.update({ embeds: [mainEmbed], components: [] });
            }

            if(buttonInteraction.customId === `confirm_clear:${interaction.user.id}`) {
                const guildDBData = await getGuildData(interaction.guild.id);
                if(!guildDBData?.hypixel_guild_id) return buttonInteraction.update({ embeds: [embeds.guildNotLinked()] });
                if(!guildDBData?.verification_role) return buttonInteraction.update({ embeds: [embeds.verificationRoleMissing()] });

                const roleMappings = guildDBData.role_mappings || {};
                await interaction.guild.members.fetch();

                let affectedMembers = 0;
                let removedRoles = 0;

                for(const member of interaction.guild.members.cache.values()) {
                    if(!member.roles.cache.has(guildDBData.verification_role)) continue;

                    const rolesToRemove = Object.values(roleMappings)
                        .map(r => r.discord_role_id)
                        .filter(rid => rid && member.roles.cache.has(rid));

                    if(rolesToRemove.length > 0) {
                        // await member.roles.remove(rolesToRemove);
                        affectedMembers++;
                        removedRoles += rolesToRemove.length;
                    }
                }

                return buttonInteraction.update({ 
                    embeds: [embeds.successEmbed(`Cleared rank roles from **${affectedMembers}** verified users.\nTotal roles removed: **${removedRoles}**`, interaction.guild.members.me.displayHexColor)], 
                    components: [] 
                });
            }
        } catch(err) {
            console.error("Error clearing roles for all users: ", err);
            
            if (buttonInteraction?.replied || buttonInteraction?.deferred)
                return buttonInteraction.followUp({ embeds: [embeds.errorEmbed('An error occurred while clearing roles.')], ephemeral: true });
            return interaction.editReply({ embeds: [embeds.errorEmbed('An error occurred while clearing roles.')], components: [] });
        }
    }
}