const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function sendButtonMessage(channel, content, buttonId, buttonLabel) {
    if(!channel || !channel.isTextBased()) return interaction.editReply({ embeds: [embeds.errorEmbed('Please select a **text** channel')] });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(buttonId).setLabel(buttonLabel).setStyle(ButtonStyle.Success)
    );
    
    const payload = { content, components: [row]};
    await channel.send(payload);
}

async function editBotMessage(channel, content, id) {
    if(!channel || !channel.isTextBased()) return interaction.editReply({ embeds: [embeds.errorEmbed('Please select a **text** channel')] });

    const targetMessage = await channel.messages.fetch(id);
    await targetMessage.edit({ content, components: targetMessage.components });
}

module.exports = { sendButtonMessage, editBotMessage };