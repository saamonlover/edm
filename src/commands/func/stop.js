const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    // Check if the bot is connected to a voice channel
    if (!global.connection) {
      const embed = new EmbedBuilder()
        .setDescription(`${global.errorIcon}  Not connected to a voice channel`)
        .setColor(process.env.ERROR_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    // Disconnect the bot from the voice channel
    global.connection.destroy()
    global.connection = null
    global.tracks = []
    global.player.stop()

    // Interaction reply
    const embed = new EmbedBuilder()
      .setDescription(
        `${global.disconnectIcon}  Stopped playing and disconnected`,
      )
      .setColor(process.env.SECONDARY_COLOR)
    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'stop',
    description: 'Stop playing and disconnect bot (queue will be cleared)',
  },
}
