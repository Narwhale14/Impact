/* Setup
1. loads local env vars
2. imports from discord.js
3. 
*/
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong')
        .toJSON()
];

(async () => {
    try {
        console.log('Registering commands...');
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log('Commands registered');
    } catch (error) {
        console.error(error);
    }
})();