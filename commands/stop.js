import { useQueue } from 'discord-player';

export default {
  name: 'stop',
  description: 'Zatrzymaj muzyczkę puszczoną przez MrQiusa',
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply(
        `MrQiusek nie będzie słuchał White'a 2115 samemu, wejdź najpierw na kanał głosowy!`
      );
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.reply(
        'MrQiusek nie ma wstępu na ten kanał, spróbuj przyintować LeeSinem na innym kanale'
      );
    }

    const queue = useQueue(message.guild);

    if (!queue || !queue.isPlaying()) {
      return message.reply('MrQiusek nie gra żadnej muzyki na tym kanale');
    }

    queue.delete();
    return message.channel.send(
      'MrQiusek ma ograniczone zasoby, żeby grać coś innego niż Łajciora 🤙🏻'
    );
  },
};
