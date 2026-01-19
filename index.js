require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// commands collection
client.commands = new Collection();
const loadCommands = (dir, category = null) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for(const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if(entry.isDirectory()) {
            if(entry.name.toLowerCase() === 'unused') continue;
            loadCommands(fullPath, entry.name);
        } else if(entry.name.endsWith('.js')) {
            const command = require(fullPath);
            client.commands.set(command.data.name, command);
        }
    }
}

loadCommands(path.join(__dirname, 'commands'));

// buttons collection init
client.buttons = new Collection();
const button = require(`./interactions/buttons.js`);
client.buttons.set(button.customId, button);

// ready event (bot comes online)
client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if(interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        if(command.adminOnly && !interaction.member.permissions.has(PermissionFlagsBits.Administrator))
            return interaction.reply({ content: 'This command is restrcited to staff only.', flag: 64 });

        try { 
            await command.execute(interaction);
        } catch(err) {
            console.error(err);
            interaction.reply({ content: 'There was an error executing that command', flag: 64 });
        }

        return;
    }

    if(interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if(!button) return;

        try {
            await button.execute(interaction);
        } catch(err) {
            console.error(err);
            interaction.reply({ content: 'There was an error handling that button', flag: 64 });
        }
        return;
    }
});

// Login
client.login(process.env.DISCORD_TOKEN);