const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    // Shuffle the queue using the Fisher-Yates (Knuth) shuffle algorithm
    for (let i = global.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[global.tracks[i], global.tracks[j]] = [
        global.tracks[j],
        global.tracks[i],
      ]
    }

    // Interaction reply
    const embed = new EmbedBuilder()
      .setDescription(`${global.shuffleIcon}  Queue shuffled`)
      .setColor(process.env.SECONDARY_COLOR)
    const embedMessage = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    })
    // Delete the embed message after 5 seconds
    setTimeout(() => {
      embedMessage.delete()
    }, 5000)
  },
  data: {
    name: 'shuffle',
    description: 'Shuffle the current queue',
  },
}
