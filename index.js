require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, channelLink, MembershipScreeningFieldType, Collection } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// ready event (bot comes online)
client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if(interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction);
    }

    // Button interactions
    if (interaction.isButton() && interaction.customId === 'verify_button') {
        const role = interaction.guild.roles.cache.get(process.env.VERIFICATION_ROLE_ID);
        if (!role) return interaction.reply({ content: 'Unable to locate "Verified" role.' });

        try {
            await interaction.member.roles.add(role);
            await interaction.reply({ content: 'You have been verified!' });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Failed to assign role.' });
        }
    }
});

// Login
client.login(process.env.DISCORD_TOKEN);