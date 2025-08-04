import { EmbedBuilder } from 'discord.js';

export default {
  name: 'leave',
  description: 'MrQius opuszcza kanał głosowy',
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Nie jesteś na żadnym kanale głosowym!')
        .setDescription('Dołącz do kanału głosowego, aby użyć tej komendy.')
        .setFooter({
          text: 'MusiQ Bot',
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.reply({ embeds: [embed], flags: 64 });
    }

    // Disconnect from voice channel
    if (interaction.guild.members.me.voice.channel) {
      interaction.guild.members.me.voice.disconnect();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('👋 MrQius opuścił kanał głosowy!')
        .setDescription('Do zobaczenia!')
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('ℹ️ MrQius nie jest na żadnym kanale głosowym!')
        .setDescription('Nie ma nic do opuszczenia.')
        .setFooter({
          text: 'MusiQ',
          iconURL: interaction.client.user.avatarURL(),
        });

      return await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
