/*
Client - the bot instance
GatewayIntentBits - letting bots see certain events
ActionRowBuilder - Container for buttons, menus, etc
ButtonBuilder - Builds a button item
ButtonStyle - styling button
Events - event names
*/

require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, channelLink, MembershipScreeningFieldType } = require('discord.js');

// tells discord what the bot wants to see
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// once the bot is online and ready to go
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const welcome_channel = await guild.channels.fetch(process.env.VERIFICATION_CHANNEL_ID);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('verify_button').setLabel('Verify').setStyle(ButtonStyle.Success)
    );

    const messagePayload = {
        content: 'Click the button to get verified',
        components: [row]
    };

    // this message will send every time the bot goes online. comment out if u dont want message to send
    const message = await welcome_channel.send(messagePayload);
});

// verify button function
client.on('interactionCreate', async interaction => {
    if(!interaction.isButton() || interaction.customId !== 'verify_button') return;

    const role = interaction.guild.roles.cache.get(process.env.VERIFICATION_ROLE_ID);
    if (!role) return interaction.reply({ content: 'Unable to locate \'Verified\' role', ephemeral: true});

    try {
        await interaction.member.roles.add(role);
    } catch(err) {
        console.error(err);
        await interaction.reply({ content: 'Failed to assign role', ephemeral: true });
    }
});

// Log in to bot
client.login(process.env.DISCORD_TOKEN);