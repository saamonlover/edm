const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    const guildId = interaction.guild.id
    const local = require('../../events/ready/00-register-local-vars')(guildId)

    if (local.tracks.length === 0) {
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

    const refreshPage = new ButtonBuilder()
      .setCustomId('refresh')
      .setLabel('↻ / <<')
      .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder().addComponents(
      previousPage,
      nextPage,
      refreshPage,
    )

    const itemsPerPage = 10
    local.currentQueuePage = 1
    const queueList = local.tracks
      .slice(0, itemsPerPage)
      .map(
        (track, index) =>
          `${index + 1}. [${track.name}  by ${track.artists.map((artist) => artist.name).join(', ')}](${track.external_urls.spotify})`,
      )
      .join('\n')

    const embed = new EmbedBuilder()
      .setDescription(`${global.queueIcon}\u200B Current queue\n\n` + queueList)
      .setColor(process.env.SECONDARY_COLOR)
    await interaction.reply({ embeds: [embed], components: [row] })
  },
  data: {
    name: 'queue',
    description: 'Show the current queue',
  },
}
