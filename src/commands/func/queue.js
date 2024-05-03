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
        .setDescription('Queue is empty')
        .setColor('#FF0000')
      return interaction.reply({ embeds: [embed] })
    }

    const nextPage = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('>')
      .setStyle(ButtonStyle.Primary)

    const previousPage = new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('<')
      .setStyle(ButtonStyle.Primary)

    const row = new ActionRowBuilder().addComponents(previousPage, nextPage)

    const itemsPerPage = 10
    global.currentQueuePage = 1

    console.log(global.tracks.length)

    const embed = new EmbedBuilder()
      .setDescription(
        global.tracks
          .slice(0, itemsPerPage)
          .map(
            (track, index) =>
              `${index + 1}. [${track.name} - ${track.artists[0].name}](${track.external_urls.spotify})`,
          )
          .join('\n'),
      )
      .setColor('#FF0000')
    await interaction.reply({ embeds: [embed], components: [row] })
  },
  data: {
    name: 'queue',
    description: 'Show the current queue',
  },
}
