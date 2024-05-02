const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    // Check if the bot is connected to a voice channel
    if (!global.connection) {
      const embed = new EmbedBuilder()
        .setDescription('Not connected to a voice channel')
        .setColor('#FF0000')
      return interaction.reply({ embeds: [embed] })
    }

    // Disconnect the bot from the voice channel
    global.connection.destroy()
    global.connection = null
    global.tracks = []
    global.player.stop()

    // Interaction reply
    const embed = new EmbedBuilder()
      .setDescription('Stopped playing and disconnected')
      .setColor('#FF0000')
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
    name: 'stop',
    description: 'Stop playing and disconnect bot (queue will be cleared)',
  },
}
