const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    if (global.tracks.length === 0) {
      const embed = new EmbedBuilder()
        .setDescription(`${global.emptyIcon}  Queue is empty`)
        .setColor(process.env.SECONDARY_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    // Head to the next track
    global.player.stop()

    // Interaction reply
    const embed = new EmbedBuilder()
      .setDescription(`${global.skipIcon}  Current song skipped`)
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
    name: 'skip',
    description: 'Skip the current song',
  },
}
