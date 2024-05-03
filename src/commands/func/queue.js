const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    if (global.tracks.length === 0) {
      const embed = new EmbedBuilder()
        .setDescription(`${global.emptyIcon}  Queue is empty`)
        .setColor(process.env.SECONDARY_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    const nextPage = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('>')
      .setStyle(ButtonStyle.Secondary)

    const previousPage = new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('<')
      .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder().addComponents(previousPage, nextPage)

    const itemsPerPage = 10
    global.currentQueuePage = 1

    const embed = new EmbedBuilder()
      .setDescription(
        `${global.queueIcon}\u200B Current queue \n\n` +
          global.tracks
            .slice(0, itemsPerPage)
            .map(
              (track, index) =>
                `${index + 1}. [${track.name} - ${track.artists[0].name}](${track.external_urls.spotify})`,
            )
            .join('\n'),
      )
      .setColor(process.env.SECONDARY_COLOR)
    await interaction.reply({ embeds: [embed], components: [row] })
  },
  data: {
    name: 'queue',
    description: 'Show the current queue',
  },
}
