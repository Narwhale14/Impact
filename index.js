require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { getGuildData } = require('./utils/guildDataManager.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// commands collection init
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// buttons collection init
client.buttons = new Collection();
const buttonsPath = path.join(__dirname, 'interactions', 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for(const file of buttonFiles) {
    const button = require(`./interactions/buttons/${file}`);
    client.buttons.set(button.customId, button);
}

// ready event (bot comes online)
client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if(interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) {
            // admin check
            const guildData = await getGuildData(interaction.guild.id);
            const adminRoleData = guildData?.admin_role;
            const hasAdminRole = adminRoleData ? interaction.member.roles.cache.has(adminRoleData.id) : false;
            if (command.adminOnly && !hasAdminRole && !interaction.member.permissions.has('Administrator'))
                return interaction.reply({ content: 'You do not have permission.', flag: 64 });
            
            await command.execute(interaction);
        }
        return;
    }

    if(interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if(button) await button.execute(interaction);
        return;
    }
});

// Login
client.login(process.env.DISCORD_TOKEN);