const { EmbedBuilder } = require('discord.js')
const { joinVoiceChannel, createAudioResource } = require('@discordjs/voice')

const YouTube = require('youtube-sr').default

module.exports = {
  callback: async (_, interaction) => {
    if (global.tracks.length === 0) {
      const embed = new EmbedBuilder()
        .setDescription('Queue is empty')
        .setColor('#FF0000')
      return interaction.reply({ embeds: [embed] })
    }

    // Head to the next track
    global.player.stop()

    // Interaction reply
    const embed = new EmbedBuilder()
      .setDescription(`Current song skipped`)
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
    name: 'skip',
    description: 'Skip the current track',
  },
}
