import 'dotenv/config';
import Discord from 'discord.js';
import fs from 'fs';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { GuildQueueEvent } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';

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

const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
    dlChunkSize: 0,
    filter: 'audioonly',
    requestOptions: {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    },
  },
  connectionTimeout: 20000,
  bufferingTimeout: 1000,
  skipFFmpeg: true,
  disableVolume: false,
  disableEqualizer: false,
  disableFilterer: false,
  disableBiquad: false,
  disableResampler: false,
  disableFallbackStream: false,
  enableStreamInterceptor: false,
  preferBridgedMetadata: true,
  maxHistorySize: Infinity,
  maxSize: Infinity,
  leaveOnEmpty: true,
  leaveOnEmptyCooldown: 0,
  leaveOnEnd: true,
  leaveOnEndCooldown: 0,
  leaveOnStop: true,
  leaveOnStopCooldown: 0,
  pauseOnEmpty: true,
  noEmitInsert: false,
});

player.extractors.loadMulti(DefaultExtractors);

player.extractors.loadMulti([YoutubeiExtractor]);

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

// Add event listeners for player errors
player.events.on('error', (queue, error) => {
  console.error(`[${new Date().toISOString()}] Player error:`, error);
});

player.events.on('playerError', (queue, error) => {
  console.error(`[${new Date().toISOString()}] Player error:`, error);
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

client.on('interactionCreate', async (interaction) => {
  const startTime = Date.now();
  console.log(
    `[${new Date().toISOString()}] Interaction received:`,
    interaction.type,
    interaction.commandName,
    'ID:',
    interaction.id
  );

  if (!interaction.isCommand()) {
    console.log('Not a command interaction, ignoring');
    return;
  }

  const command = client.commands.get(interaction.commandName);
  console.log('Command found:', command ? command.name : 'NOT FOUND');

  if (!command) {
    console.log('Command not found for:', interaction.commandName);
    return;
  }

  try {
    console.log(
      `[${new Date().toISOString()}] Executing command:`,
      command.name
    );
    await command.execute(interaction);
    console.log(
      `[${new Date().toISOString()}] Command executed successfully:`,
      command.name,
      `(took ${Date.now() - startTime}ms)`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error executing command:`,
      command.name,
      error
    );

    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: 'Wystąpił błąd podczas wykonywania komendy!',
          flags: 64,
        });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    } else {
      try {
        await interaction.followUp({
          content: 'Wystąpił błąd podczas wykonywania komendy!',
          flags: 64,
        });
      } catch (followUpError) {
        console.error('Failed to send error follow-up:', followUpError);
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
