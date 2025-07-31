import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} from 'discord.js';

export default {
  name: 'help',
  description: 'Wyświetl listę dostępnych komend bota',
  async execute(message) {
    const commands = message.client.commands; // Pobierz wszystkie komendy

    // Embed z opisem
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📜 Lista dostępnych komend')
      .setDescription('Wybierz komendę z menu poniżej, aby zobaczyć szczegóły.')
      .setFooter({
        text: 'MrQius Bot',
        iconURL: message.client.user.avatarURL(),
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
    await message.reply({ embeds: [embed], components: [row] });

    // Obsługa interakcji z menu wyboru
    const filter = (interaction) =>
      interaction.customId === 'select-command' &&
      interaction.user.id === message.author.id;

    const collector = message.channel.createMessageComponentCollector({
      filter,
      time: 60000, // Czas na interakcję (60 sekund)
    });

    collector.on('collect', async (interaction) => {
      const selectedCommand = commands.get(interaction.values[0]); // Pobierz wybraną komendę
      if (!selectedCommand) return;

      // Wyświetl szczegóły wybranej komendy
      const commandEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`📖 Szczegóły komendy: ${selectedCommand.name}`)
        .setDescription(selectedCommand.description)
        .setFooter({
          text: 'MrQius Bot',
          iconURL: message.client.user.avatarURL(),
        });

      await interaction.update({ embeds: [commandEmbed], components: [] }); // Zaktualizuj wiadomość
    });

    collector.on('end', () => {
      // Usuń interaktywne elementy po zakończeniu czasu
      message.edit({ components: [] });
    });
  },
};
