const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    const index = interaction.options.getInteger('position') - 1
    if (index < 0 || index >= global.tracks.length) {
      const embed = new EmbedBuilder()
        .setDescription(`${global.errorIcon}  Invalid position number`)
        .setColor(process.env.ERROR_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    const removedTrack = global.tracks[index]
    global.tracks.splice(index, 1)

    const embed = new EmbedBuilder()
      .setDescription(
        `${global.removeIcon}  Removed song at [${index + 1}] **[${removedTrack.name} by ${removedTrack.artists.map((artist) => artist.name).join(', ')}](${removedTrack.external_urls.spotify})**`,
      )
      .setColor(process.env.SECONDARY_COLOR)
    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'remove',
    description: 'Remove a specific song from the queue',
    options: [
      {
        name: 'position',
        type: 4,
        description: 'The position of the song you want to remove',
        required: true,
      },
    ],
  },
}
