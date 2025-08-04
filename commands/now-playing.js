import { useQueue } from 'discord-player';
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'nowplaying',
  description: 'Wykryj, co MrQius aktualnie gra',
  async execute(interaction) {
    const queue = useQueue(interaction.guild);

    if (!queue) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🎵 MrQius nie gra aktualnie żadnej muzyki')
        .setDescription('woof woof woof')
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.reply({ embeds: [embed], flags: 64 });
    }

    const currentSong = queue.currentTrack;

    if (!currentSong) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🎵 Przecież MrQius teraz nic nie gra kasztanie xdd')
        .setDescription('Nie ma aktualnie odtwarzanego utworu')
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.reply({ embeds: [embed], flags: 64 });
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎶 MrQius gra teraz:')
      .setDescription(`**${currentSong.title}**`)
      .addFields({
        name: '📺 Platforma',
        value: getPlatformName(currentSong.queryType),
        inline: true,
      })
      .setFooter({
        text: 'MusiQ',
        iconURL: interaction.client.user.avatarURL(),
      });

    if (
      currentSong.thumbnail &&
      currentSong.thumbnail.trim() !== '' &&
      currentSong.thumbnail !== 'null'
    ) {
      try {
        new URL(currentSong.thumbnail);
        embed.setThumbnail(currentSong.thumbnail);
      } catch (urlError) {
        console.log(
          'Invalid thumbnail URL in now-playing:',
          currentSong.thumbnail
        );
      }
    }

    return await interaction.reply({ embeds: [embed] });
  },
};

function getPlatformName(queryType) {
  console.log(`[DEBUG] queryType received in now-playing: "${queryType}"`);

  const platformMap = {
    youtubeVideo: 'YouTube',
    youtubePlaylist: 'YouTube Playlist',
    soundcloudTrack: 'SoundCloud',
    soundcloudPlaylist: 'SoundCloud Playlist',
    spotifyTrack: 'Spotify',
    spotifyPlaylist: 'Spotify Playlist',
    spotifyAlbum: 'Spotify Album',
    applemusicTrack: 'Apple Music',
    applemusicPlaylist: 'Apple Music Playlist',
    applemusicAlbum: 'Apple Music Album',
    vimeoVideo: 'Vimeo',
    reverbnationTrack: 'ReverbNation',
    attachment: 'Plik',
    unknown: 'Nieznana platforma',
    spotify: 'Spotify',
    youtube: 'YouTube',
    soundcloud: 'SoundCloud',
    applemusic: 'Apple Music',
    vimeo: 'Vimeo',
    reverbnation: 'ReverbNation',
    'spotify-track': 'Spotify',
    'youtube-video': 'YouTube',
    'soundcloud-track': 'SoundCloud',
    'apple-music-track': 'Apple Music',
    'vimeo-video': 'Vimeo',
    'reverbnation-track': 'ReverbNation',
  };

  const platform = platformMap[queryType];
  console.log(`[DEBUG] Platform found in now-playing: "${platform}"`);

  return platform || 'Nieznana platforma';
}
