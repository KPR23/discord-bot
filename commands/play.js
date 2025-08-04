import { EmbedBuilder } from 'discord.js';

export default {
  name: 'play',
  description: `MrQius puści muzyczkę ze swojego JBL'a`,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle("❌ MrQiusek nie będzie słuchał White'a 2115 samemu!")
        .setDescription(
          '➡️ Panie kolego, najpierw dołącz na kanał głosowy, a potem spróbuj ponownie.'
        )
        .setFooter({
          text: 'MusiQ Bot',
          iconURL: interaction.client.user.avatarURL(),
        });

      try {
        return await interaction.reply({ embeds: [embed], flags: 64 });
      } catch (error) {
        return;
      }
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);

    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🚫 MrQiusek nie ma wstępu na ten kanał!')
        .setDescription(
          '🔒 Spróbuj zaprosić go na inny kanał, gdzie ma odpowiednie uprawnienia.'
        )
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      try {
        return await interaction.reply({ embeds: [embed], flags: 64 });
      } catch (error) {
        return;
      }
    }

    let query = interaction.options.getString('song');

    if (!query) {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎵 Podaj tytuł piosenki')
        .setDescription(
          '📖 Przykład: `/play White 2115 - California`\n\n**Dostępne prefiksy:**\n• `.yt` - YouTube\n• `.sc` - SoundCloud\n• `.sp` - Spotify (wymaga bezpośrednich linków)\n• `.am` - Apple Music\n• `.vm` - Vimeo\n• `.rn` - ReverbNation\n\n**Uwaga:** Spotify może wymagać bezpośrednich linków zamiast wyszukiwania tekstowego.'
        )
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      try {
        return await interaction.reply({ embeds: [embed], flags: 64 });
      } catch (error) {
        return;
      }
    }

    let provider = null;
    let searchQuery = query;

    // Check for provider prefix at the end (e.g., "song .yt", "song .sc")
    const prefixMatch = query.match(/\s*\.(\w+)\s*$/);
    if (prefixMatch) {
      provider = prefixMatch[1].toLowerCase();
      searchQuery = query.replace(/\s*\.\w+\s*$/, '').trim();

      const providerMap = {
        yt: 'youtube',
        youtube: 'youtube',
        sc: 'soundcloud',
        soundcloud: 'soundcloud',
        sp: 'spotify',
        spotify: 'spotify',
        am: 'applemusic',
        applemusic: 'applemusic',
        vm: 'vimeo',
        vimeo: 'vimeo',
        rn: 'reverbnation',
        reverbnation: 'reverbnation',
      };

      if (providerMap[provider]) {
        provider = providerMap[provider];
      }

      console.log(
        `[DEBUG] Provider prefix detected: "${prefixMatch[1]}" -> mapped to: "${provider}"`
      );
    }

    try {
      const loadingEmbed = new EmbedBuilder()
        .setColor('#0000FF')
        .setTitle(
          '🔍 MrQius szuka tej piosenki... (albo udaje, tak jak z uczeniem się)'
        )
        .setDescription('⏳ Proszę się tam nie pieklić')
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      await interaction.reply({ embeds: [loadingEmbed] });

      console.log(
        `[${new Date().toISOString()}] Attempting to play:`,
        searchQuery,
        provider ? `(provider: ${provider})` : ''
      );

      const playOptions = {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild.members.me,
            requestedBy: interaction.user,
          },
          volume: 100,
          leaveOnEmpty: true,
          leaveOnEnd: true,
          leaveOnStop: true,
          skipFFmpeg: true,
        },
      };

      if (provider) {
        const extractorKey = `com.discord-player.${provider}extractor`;
        const extractor =
          interaction.client.player.extractors.store.get(extractorKey);

        console.log(
          `[DEBUG] Looking for extractor with key: "${extractorKey}"`
        );
        console.log(
          `[DEBUG] Available extractors:`,
          Array.from(interaction.client.player.extractors.store.keys())
        );

        if (extractor) {
          playOptions.extractor = extractor;
          console.log(
            `[${new Date().toISOString()}] Using specific extractor:`,
            provider
          );
        } else {
          console.log(
            `[${new Date().toISOString()}] Provider ${provider} not found, using default search`
          );
          console.log(`[DEBUG] Extractor not found for key: "${extractorKey}"`);
        }
      }

      const { track } = await interaction.client.player.play(
        voiceChannel,
        searchQuery,
        playOptions
      );

      console.log(`[${new Date().toISOString()}] Track found:`, {
        title: track.title,
        url: track.url,
        thumbnail: track.thumbnail,
        duration: track.duration,
        author: track.author,
        queryType: track.queryType,
        requestedProvider: provider,
        actualProvider: getProviderFromQueryType(track.queryType),
        urlIncludesSpotify: track.url.includes('spotify'),
        urlIncludesYoutube: track.url.includes('youtube'),
        urlIncludesSoundcloud: track.url.includes('soundcloud'),
      });

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎶 MrQius puścił muzyczkę')
        .setDescription(
          `🎵 **[${track.title}](${track.url})**\n😋 ale gówno puściłeś xdd`
        )
        .addFields({
          name: '📺 Platforma',
          value: getPlatformName(track.queryType, track.url),
          inline: true,
        });

      if (provider && getProviderFromQueryType(track.queryType) !== provider) {
        successEmbed.addFields({
          name: '⚠️ Uwaga',
          value: `Żądano: **${getPlatformName(
            provider
          )}**, znaleziono: **${getPlatformName(track.queryType, track.url)}**`,
          inline: true,
        });
      }

      if (
        track.thumbnail &&
        track.thumbnail.trim() !== '' &&
        track.thumbnail !== 'null'
      ) {
        try {
          new URL(track.thumbnail);
          successEmbed.setThumbnail(track.thumbnail);
        } catch (urlError) {
          console.log('Invalid thumbnail URL:', track.thumbnail);
        }
      }

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error playing track:`,
        error
      );

      let errorMessage = '🤔 Może potrzebujesz rekomendacji? /play White 2115';

      if (error.code === 'ERR_NO_RESULT') {
        errorMessage =
          '❌ Nie udało się znaleźć tej piosenki. Spróbuj innego tytułu lub linku.';
      } else if (
        error.message &&
        error.message.includes('Could not extract stream')
      ) {
        errorMessage =
          '❌ Nie można odtworzyć tego utworu. Spróbuj innego źródła lub sprawdź czy link jest poprawny.';
      } else if (error.message && error.message.includes('Video unavailable')) {
        errorMessage = '❌ Ten film jest niedostępny lub prywatny.';
      } else if (error.message && error.message.includes('Sign in')) {
        errorMessage = '❌ Ten utwór wymaga logowania. Spróbuj innego źródła.';
      } else if (error.message && error.message.includes('Age restricted')) {
        errorMessage =
          '❌ Ten utwór ma ograniczenia wiekowe. Spróbuj innego źródła.';
      }

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❗ MrQius miał problemy ze znalezieniem tej piosenki!')
        .setDescription(errorMessage)
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      try {
        if (interaction.replied) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
        try {
          await interaction.followUp({ embeds: [errorEmbed], flags: 64 });
        } catch (followUpError) {
          console.error('Failed to send follow-up message:', followUpError);
        }
      }
    }
  },
};

// Helper function to get platform name
function getPlatformName(queryType, url = null) {
  console.log(`[DEBUG] queryType received: "${queryType}"`);
  console.log(`[DEBUG] URL received: "${url}"`);

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
    // Dodatkowe mapowania dla różnych wariantów
    spotify: 'Spotify',
    youtube: 'YouTube',
    soundcloud: 'SoundCloud',
    applemusic: 'Apple Music',
    vimeo: 'Vimeo',
    reverbnation: 'ReverbNation',
    // Mapowania dla różnych formatów
    'spotify-track': 'Spotify',
    'youtube-video': 'YouTube',
    'soundcloud-track': 'SoundCloud',
    'apple-music-track': 'Apple Music',
    'vimeo-video': 'Vimeo',
    'reverbnation-track': 'ReverbNation',
    // Dodatkowe mapowania dla Spotify
    'spotify-track': 'Spotify',
    'spotify-playlist': 'Spotify Playlist',
    'spotify-album': 'Spotify Album',
    spotify_track: 'Spotify',
    spotify_playlist: 'Spotify Playlist',
    spotify_album: 'Spotify Album',
    spotifytrack: 'Spotify',
    spotifyplaylist: 'Spotify Playlist',
    spotifyalbum: 'Spotify Album',
    'spotify-track': 'Spotify',
    'spotify-playlist': 'Spotify Playlist',
    'spotify-album': 'Spotify Album',
  };

  let platform = platformMap[queryType];
  console.log(`[DEBUG] Platform found from queryType: "${platform}"`);

  // Jeśli nie znaleziono platformy z queryType, spróbuj z URL
  if (!platform && url) {
    platform = detectPlatformFromUrl(url);
    console.log(`[DEBUG] Platform found from URL: "${platform}"`);
  }

  return platform || 'Nieznana platforma';
}

function getProviderFromQueryType(queryType) {
  if (queryType.includes('youtube')) return 'youtube';
  if (queryType.includes('spotify')) return 'spotify';
  if (queryType.includes('soundcloud')) return 'soundcloud';
  if (queryType.includes('applemusic')) return 'applemusic';
  if (queryType.includes('vimeo')) return 'vimeo';
  if (queryType.includes('reverbnation')) return 'reverbnation';
  return 'unknown';
}

function detectPlatformFromUrl(url) {
  if (url.includes('spotify.com')) return 'Spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('soundcloud.com')) return 'SoundCloud';
  if (url.includes('music.apple.com')) return 'Apple Music';
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('reverbnation.com')) return 'ReverbNation';
  return null;
}
