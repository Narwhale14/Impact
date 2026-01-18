const { SlashCommandBuilder } = require('discord.js');
const { getGuildData } = require('../../utils/guildDataManager.js');
const { updateLinkedPlayers } = require(`../../utils/linkedPlayersManager.js`);
const { getPlayerByName, getMemberInGuildByPlayerUUID } = require('../../utils/hypixelAPIManager.js');

/**
 * @command - /link
 * links a user to their hypixel minecraft account
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Links to your Minecraft Hypixel account')
        .addStringOption(option => option.setName('name').setDescription('Account name (MUST have discord connected)').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const minecraftName = interaction.options.getString('name');
            const discordId = interaction.user.id;

            const guildDBData = await getGuildData(interaction.guild.id);
            if(!guildDBData.hypixel_guild_id) return interaction.editReply("This server isn't linked to a Hypixel guild yet!");

            // fetch player data from API
            const player = await getPlayerByName(minecraftName);
            if(!player) return interaction.editReply(`Minecraft player with username **${minecraftName}** does not exist!`);

            const playerDiscord = player.socialMedia?.links?.DISCORD;
            if(!playerDiscord) 
                return interaction.editReply(`Minecraft player with username **${minecraftName}** does not have a Discord linked.\nHow to set:\n1) Go to hypixel lobby\n2) Click your player head in hotbar\n3) Go to Social Media -> Discord\n4) Click and type Discord username in chat!`);
            if(playerDiscord !== interaction.user.username.toLowerCase())
                return interaction.editReply(
                    `The Discord linked to the Hypixel account **${minecraftName}** does not match your discord username.\n` +
                    `Currently linked Discord on hypixel: **${playerDiscord}**\n` +
                    `Your Discord: **${interaction.user.username}**\n\n` +
                    `If this is your account, you may need to reconnect your discord this way:\n` +
                    `1) Go to hypixel lobby\n2) Click your player head in hotbar\n3) Go to Social Media -> Discord\n4) Click and type Discord username in chat!`
                );

            // check if player is in guild
            const member = await getMemberInGuildByPlayerUUID(player.uuid);
            if (!member) return interaction.editReply(`Minecraft player with username **${minecraftName} is not in any guild.`);
            if(member.guild_id !== guildDBData.hypixel_guild_id)
                return interaction.editReply(`You are not in the guild linked to the server.`);

            // upsert linked player
            await updateLinkedPlayers({ 
                discordId, 
                hypixelUUID: player.uuid, 
                hypixelName: player.displayname, 
                guildDataId: guildDBData.id 
            });

            interaction.editReply(`Successfully linked **${player.displayname}** to your Discord account!`);
        } catch(err) {
            console.error("Error fetching player: ", err);

            if(typeof err.message === 'string' && err.message.toLowerCase().includes('already looked up this name'))
                return interaction.editReply("That minecraft username was looked up very recently!\nPlease wait **1 minute** before trying to link again.");

            await interaction.editReply("An error occured while linking your account.\nPlease try again later.");
        }
    }
}