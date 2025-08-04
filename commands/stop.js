import { useQueue } from 'discord-player';
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'stop',
  description: 'Zatrzymaj muzyczkę puszczoną przez MrQiusa',
  async execute(interaction) {
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

      return await interaction.reply({ embeds: [embed], flags: 64 });
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

      return await interaction.reply({ embeds: [embed], flags: 64 });
    }

    const queue = useQueue(interaction.guild);

    if (!queue || !queue.isPlaying()) {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🎵 MrQiusek nie gra żadnej muzyki')
        .setDescription('Nie ma nic do zatrzymania!')
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.reply({ embeds: [embed], flags: 64 });
    }

    queue.delete();

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('⏹️ MrQiusek zatrzymał muzyczkę!')
      .setDescription(
        'MrQiusek ma ograniczone zasoby, żeby grać coś innego niż Łajciora 🤙🏻'
      )
      .setFooter({
        text: 'MusiQ',
        iconURL: interaction.client.user.avatarURL(),
      });

    return await interaction.reply({ embeds: [embed] });
  },
};
