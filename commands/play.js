import { EmbedBuilder } from 'discord.js';

export default {
  name: 'p',
  description: 'Zmuś MrQiusa do puszczenia muzyczki z YouTube',
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle("❌ MrQiusek nie będzie słuchał White'a 2115 samemu!")
        .setDescription(
          '➡️ Panie kolego, najpierw dołącz na kanał głosowy, a potem spróbuj ponownie.'
        )
        .setFooter({
          text: 'MusiQ Bot',
          iconURL: message.client.user.avatarURL(),
        });

      return message.reply({ embeds: [embed] });
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500') // Pomarańczowy kolor dla ostrzeżenia
        .setTitle('🚫 MrQiusek nie ma wstępu na ten kanał!')
        .setDescription(
          '🔒 Spróbuj zaprosić go na inny kanał, gdzie ma odpowiednie uprawnienia.'
        )
        .setFooter({
          text: 'MrQius Bot',
          iconURL: message.client.user.avatarURL(),
        });

      return message.reply({ embeds: [embed] });
    }

    const query = args.join(' ');

    if (!query) {
      const embed = new EmbedBuilder()
        .setColor('#00FF00') // Zielony kolor dla informacji
        .setTitle('🎵 Podaj tytuł piosenki!')
        .setDescription('📖 Przykład: `.play White 2115 - California`')
        .setFooter({
          text: 'MrQius Bot',
          iconURL: message.client.user.avatarURL(),
        });

      return message.reply({ embeds: [embed] });
    }

    try {
      const loadingEmbed = new EmbedBuilder()
        .setColor('#0000FF') // Niebieski kolor dla ładowania
        .setTitle('🔍 MrQius szuka tej piosenki...')
        .setDescription('⏳ Chwila cierpliwości!')
        .setFooter({
          text: 'MrQius Bot',
          iconURL: message.client.user.avatarURL(),
        });

      const loadingMsg = await message.reply({ embeds: [loadingEmbed] });

      const { track } = await message.client.player.play(voiceChannel, query, {
        nodeOptions: {
          metadata: {
            channel: message.channel,
            client: message.guild.members.me,
            requestedBy: message.user,
          },
          ytdlOptions: {
            quality:
              'highestaudio[ext=webm]/highestaudio[ext=m4a]/highestaudio',
            highWaterMark: 1 << 25,
            dlChunkSize: 0,
            filter: 'audioonly',
            requestOptions: {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
            },
            liveBuffer: 40000,
            isHLS: false,
            begin: '0s',
            range: {
              start: 0,
              end: Infinity,
            },
          },
          volume: 100,
          leaveOnEmpty: true,
          leaveOnEnd: true,
          leaveOnStop: true,
        },
      });

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00') // Zielony kolor dla sukcesu
        .setTitle('🎶 MrQius zapuścił muzyczkę!')
        .setDescription(
          `➡️ **[${track.title}](${track.url})**\n🎧 Miłego słuchania!`
        )
        .setThumbnail(track.thumbnail) // Miniaturka utworu
        .setFooter({
          text: 'MrQius Bot',
          iconURL: message.client.user.avatarURL(),
        });

      await loadingMsg.edit({ embeds: [successEmbed] });
    } catch (error) {
      console.error('Error playing track:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000') // Czerwony kolor dla błędu
        .setTitle('❗ MrQius miał problemy ze znalezieniem tej piosenki!')
        .setDescription('🤔 Może spróbuj podać bardziej precyzyjny tytuł?')
        .setFooter({
          text: 'MrQius Bot',
          iconURL: message.client.user.avatarURL(),
        });

      await message.reply({ embeds: [errorEmbed] });
    }
  },
};
