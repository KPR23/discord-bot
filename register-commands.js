import { REST, Routes } from 'discord.js';
import fs from 'fs/promises';

const config = JSON.parse(
  await fs.readFile(new URL('./config.json', import.meta.url), 'utf-8')
);
const { clientId, guildId, token } = config;

const commands = [
  {
    name: 'play',
    description: `MrQius puści muzyczkę ze swojego JBL'a`,
    options: [
      {
        name: 'song',
        type: 3,
        description:
          'Tytuł piosenki lub link do odtworzenia, po query możesz dodaćprovider (yt, sc, sp, am, vm, rn)',
        required: true,
      },
    ],
  },
  {
    name: 'stop',
    description: 'Zatrzymaj muzyczkę puszczoną przez MrQiusa',
  },
  {
    name: 'nowplaying',
    description: 'Wykryj, co MrQius aktualnie gra',
  },
  {
    name: 'leave',
    description: 'MrQius opuszcza kanał głosowy',
  },
  {
    name: 'help',
    description: 'Wyświetl listę dostępnych komend bota',
  },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Rejestracja komend...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log('Komendy zostały zarejestrowane!');
  } catch (error) {
    console.error(error);
  }
})();
