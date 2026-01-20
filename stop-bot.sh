#!/bin/bash
echo "Stopping DiscordBotSI..."
pkill -f /home/niall/projects/DiscordBotSI/index.js
pm2 delete all
echo "All stopped."