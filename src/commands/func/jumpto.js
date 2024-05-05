const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    const index = interaction.options.getInteger('position') - 1
    if (index < 0 || index >= global.tracks.length) {
      const embed = new EmbedBuilder()
        .setDescription(`${global.errorIcon}  Invalid posiiton number`)
        .setColor(process.env.ERROR_COLOR)
      const embedError = await interaction.reply({
        embeds: [embed],
        fetchReply: true,
      })
      // Delete the embed message after 5 seconds
      setTimeout(() => {
        embedError.delete()
      }, 2000)
      return
    }

    // Skip the queue to the selected index
    const selectedTrack = global.tracks.splice(index, 1)[0]
    global.tracks = global.tracks.slice(index) // Remove the skipped songs
    global.tracks.unshift(selectedTrack) // Add the selected song to the beginning
    global.player.stop() // Stop the current song and play the next

    const embed = new EmbedBuilder()
      .setDescription(
        `${global.jumptoIcon} Jumped to [${index + 1}] **[${selectedTrack.name} by ${selectedTrack.artists[0].name}](${selectedTrack.external_urls.spotify})**`,
      )
      .setColor(process.env.PRIMARY_COLOR)
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
    name: 'jumpto',
    description: 'Jump to a specific song in the queue',
    options: [
      {
        name: 'position',
        type: 4,
        description: 'The position you want to jump to',
        required: true,
      },
    ],
  },
}
