export default {
  name: 'leave',
  description: 'MrQius opuszcza kanał głosowy',
  execute(message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply('Nie jesteś na żadnym kanale głosowym!');
    }

    // Disconnect from voice channel
    if (message.guild.members.me.voice.channel) {
      message.guild.members.me.voice.disconnect();
      message.reply('MrQius opuścił kanał głosowy! 👋');
    } else {
      message.reply('MrQius nie jest na żadnym kanale głosowym!');
    }
  },
};

