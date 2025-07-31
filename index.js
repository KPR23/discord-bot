import 'dotenv/config';
import Discord from 'discord.js';
import fs from 'fs';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { GuildQueueEvent } from 'discord-player';

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

const prefix = '/';

client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.name, command.default);
}

const player = new Player(client);

player.extractors.loadMulti(DefaultExtractors);

client.player = player;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activities: [
      {
        name: 'White 2115 - California',
        type: 2,
      },
    ],
    status: 'online',
  });
});

player.events.on(GuildQueueEvent.PlayerFinish, async (queue, track) => {
  const { channel } = queue.metadata;
  await channel.send(`Koniec mych boleści, pora na Łajciora 🤙🏻`);
});

client.on('messageCreate', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const commandFile = client.commands.get(command);

  if (commandFile) {
    try {
      commandFile.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('Wystąpił błąd podczas wykonywania komendy!');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
