import { useQueue } from 'discord-player';

export default {
  name: 'np',
  description: 'Wykryj, co MrQius aktualnie gra',
  execute(message, args) {
    const queue = useQueue(message.guild);

    if (!queue) {
      return message.reply('MrQius nie gra aktualnie żadnej muzyki!');
    }

    const currentSong = queue.currentTrack;

    if (!currentSong) {
      return message.reply('Przecież MrQius teraz nic nie gra kasztanie xdd');
    }

    return message.reply(`🎶 MrQius gra teraz: **${currentSong.title}** 🎶`);
  },
};
