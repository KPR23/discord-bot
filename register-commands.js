import { REST, Routes } from 'discord.js';
import { clientId, guildId, token } from './config.json';

const commands = [
  {
    name: 'play',
    description: 'Odtwórz piosenkę z YouTube lub innej platformy',
    options: [
      {
        name: 'song',
        type: 3, // Typ 3 = tekst
        description: 'Tytuł piosenki lub link do odtworzenia',
        required: true,
      },
    ],
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
