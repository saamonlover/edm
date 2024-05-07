const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    const guildId = interaction.guild.id
    const local = require('../../events/ready/00-register-local-vars')(guildId)

    if (!local.tracks.length) {
      const embed = new EmbedBuilder()
        .setDescription(`${global.errorIcon}  Add a song to the queue before shuffling`)
        .setColor(process.env.ERROR_COLOR)
      return await interaction.reply({ embeds: [embed] })
    }

    // Remove the next playing track from the queue
    const currentTrack = local.tracks.shift()

    // Shuffle the rest of the queue using the Fisher-Yates (Knuth) shuffle algorithm
    for (let i = local.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[local.tracks[i], local.tracks[j]] = [local.tracks[j], local.tracks[i]]
    }

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * local.tracks.length)

    // Add the next playing track back at a random position in the queue
    local.tracks.splice(randomIndex, 0, currentTrack)

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
