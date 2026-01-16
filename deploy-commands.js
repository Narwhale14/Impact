require('dotenv').config();
const fs = require('fs');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON());
}

// register slash cmds
(async () => {
    try {
        console.log(`Registering ${commands.length} commands...`);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log('Commands registered successfully!');
    } catch(err) {
        console.error(err);
    }
})();