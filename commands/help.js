import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} from 'discord.js';

export default {
  name: 'help',
  description: 'Wyświetl listę dostępnych komend bota',
  async execute(interaction) {
    const commands = interaction.client.commands; // Pobierz wszystkie komendy

    // Embed z opisem
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📜 Lista dostępnych komend')
      .setDescription('Wybierz komendę z menu poniżej, aby zobaczyć szczegóły.')
      .addFields({
        name: '🎵 Nowa funkcja: Prefiksy dostawców',
        value:
          'Możesz teraz określić dostawcę muzyki dodając prefiks na końcu zapytania:\n• `.yt` - YouTube\n• `.sc` - SoundCloud\n• `.sp` - Spotify\n• `.am` - Apple Music\n• `.vm` - Vimeo\n• `.rn` - ReverbNation\n\nPrzykład: `/play White 2115 .yt`',
      })
      .setFooter({
        text: 'MusiQ',
        iconURL: interaction.client.user.avatarURL(),
      });

    // Tworzenie menu wyboru
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select-command') // ID menu wyboru
      .setPlaceholder('Wybierz komendę...') // Tekst widoczny przed wyborem
      .addOptions(
        commands.map((command) => ({
          label: command.name, // Nazwa komendy
          description: command.description, // Opis komendy
          value: command.name, // Wartość, która zostanie zwrócona po wyborze
        }))
      );

    // Dodanie menu wyboru do wiadomości
    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Wyślij wiadomość z embedem i menu wyboru
    await interaction.reply({ embeds: [embed], components: [row] });

    // Obsługa interakcji z menu wyboru
    const filter = (i) =>
      i.customId === 'select-command' && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000, // Czas na interakcję (60 sekund)
    });

    collector.on('collect', async (i) => {
      const selectedCommand = commands.get(i.values[0]); // Pobierz wybraną komendę
      if (!selectedCommand) return;

      // Wyświetl szczegóły wybranej komendy
      const commandEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`📖 Szczegóły komendy: ${selectedCommand.name}`)
        .setDescription(selectedCommand.description)
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      await i.update({ embeds: [commandEmbed], components: [] }); // Zaktualizuj wiadomość
    });

    collector.on('end', () => {
      // Usuń interaktywne elementy po zakończeniu czasu
      interaction.editReply({ components: [] }).catch(() => {
        // Ignore errors if message was deleted
      });
    });
  },
};
