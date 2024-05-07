const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js')

module.exports = async (_, interaction) => {
  const guildId = interaction.guild.id
  const local = require('../../events/ready/00-register-local-vars')(guildId)

  if (!interaction.isButton()) return

  const itemsPerPage = 10
  const pages = Math.ceil(local.tracks.length / itemsPerPage)

  let newPage

  if (interaction.customId === 'previous') {
    // If the 'previous' button was clicked, decrement the page number
    newPage = Math.max(local.currentQueuePage - 1, 1)
  } else if (interaction.customId === 'next') {
    // If the 'next' button was clicked, increment the page number
    newPage = Math.min(local.currentQueuePage + 1, pages)
  }

  // When refresh button is clicked, set the page to 1
  if (interaction.customId === 'refresh') {
    newPage = 1
  }

  const start = (newPage - 1) * itemsPerPage
  const end = start + itemsPerPage

  local.currentQueuePage = newPage

  const embed = new EmbedBuilder()
    .setDescription(
      `${global.queueIcon}\u200B Current queue \n\n` +
        local.tracks
          .slice(start, end)
          .map(
            (track, index) =>
              `${index + 1 + start}. [${track.name}  by ${track.artists.map((artist) => artist.name).join(', ')}](${track.external_urls.spotify})`,
          )
          .join('\n'),
    )
    .setColor(process.env.SECONDARY_COLOR)

  const nextPage = new ButtonBuilder()
    .setCustomId('next')
    .setLabel('>')
    .setStyle(ButtonStyle.Secondary)

  const previousPage = new ButtonBuilder()
    .setCustomId('previous')
    .setLabel('<')
    .setStyle(ButtonStyle.Secondary)

  const refreshPage = new ButtonBuilder()
    .setCustomId('refresh')
    .setLabel('↻ / <<')
    .setStyle(ButtonStyle.Secondary)

  const row = new ActionRowBuilder().addComponents(
    previousPage,
    nextPage,
    refreshPage,
  )

  await interaction.update({ embeds: [embed], components: [row] })
}
