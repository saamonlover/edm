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
    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'skip',
    description: 'Skip the current song',
  },
}
