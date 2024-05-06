const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    // Remove the next playing track from the queue
    const currentTrack = global.tracks.shift()

    // Shuffle the rest of the queue using the Fisher-Yates (Knuth) shuffle algorithm
    for (let i = global.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[global.tracks[i], global.tracks[j]] = [
        global.tracks[j],
        global.tracks[i],
      ]
    }

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * global.tracks.length)

    // Add the next playing track back at a random position in the queue
    global.tracks.splice(randomIndex, 0, currentTrack)

    // Interaction reply
    const embed = new EmbedBuilder()
      .setDescription(`${global.shuffleIcon}  Queue shuffled`)
      .setColor(process.env.SECONDARY_COLOR)
    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'shuffle',
    description: 'Shuffle the current queue',
  },
}
