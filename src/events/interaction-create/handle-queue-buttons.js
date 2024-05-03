const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js')

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return

  const itemsPerPage = 10
  const pages = Math.ceil(global.tracks.length / itemsPerPage)

  let newPage

  if (interaction.customId === 'previous') {
    // If the 'previous' button was clicked, decrement the page number
    newPage = Math.max(global.currentQueuePage - 1, 1)
  } else if (interaction.customId === 'next') {
    // If the 'next' button was clicked, increment the page number
    newPage = Math.min(global.currentQueuePage + 1, pages)
  }

  const start = (newPage - 1) * itemsPerPage
  const end = start + itemsPerPage

  global.currentQueuePage = newPage

  const embed = new EmbedBuilder()
    .setDescription(
      global.tracks
        .slice(start, end)
        .map(
          (track, index) =>
            `${index + 1}. [${track.name} - ${track.artists[0].name}](${track.external_urls.spotify})`,
        )
        .join('\n'),
    )
    .setColor('#FF0000')

  const nextPage = new ButtonBuilder()
    .setCustomId('next')
    .setLabel('>')
    .setStyle(ButtonStyle.Primary)

  const previousPage = new ButtonBuilder()
    .setCustomId('previous')
    .setLabel('<')
    .setStyle(ButtonStyle.Primary)

  const row = new ActionRowBuilder().addComponents(previousPage, nextPage)

  await interaction.update({ embeds: [embed], components: [row] })
}
