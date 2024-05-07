const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    const guildId = interaction.guild.id
    const local = require('../../events/ready/00-register-local-vars')(guildId)

    const index = interaction.options.getInteger('position') - 1
    if (index < 0 || index >= local.tracks.length) {
      const embed = new EmbedBuilder()
        .setDescription(`${global.errorIcon}  Invalid posiiton number`)
        .setColor(process.env.ERROR_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    // Skip the queue to the selected index
    const selectedTrack = local.tracks.splice(index, 1)[0]
    local.tracks = local.tracks.slice(index) // Remove the skipped songs
    local.tracks.unshift(selectedTrack) // Add the selected song to the beginning
    local.player.stop() // Stop the current song and play the next

    const embed = new EmbedBuilder()
      .setDescription(
        `${global.jumptoIcon} Jumped to [${index + 1}] **[${selectedTrack.name} by ${selectedTrack.artists.map((artist) => artist.name).join(', ')}](${selectedTrack.external_urls.spotify})**`,
      )
      .setColor(process.env.PRIMARY_COLOR)
    await interaction.reply({ embeds: [embed] })
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
