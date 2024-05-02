const { EmbedBuilder } = require('discord.js')

module.exports = async (client, oldState, newState) => {
  // Check if the bot was disconnected from the voice channel
  if (
    oldState.member.id === client.user.id &&
    oldState.channelId &&
    !newState.channelId
  ) {
    // Set global.connection back to null and stop the player
    // Since player stop operation actually sklips to the next item in queue
    // Need to clear the queue as well
    global.connection = null
    global.tracks = []
    global.player.stop()

    console.log('> [voice-state-update] dsisconnected')
  }

  /* // Give out temporary notice
  if (global.connection) {
    console.log('> [voice-state-update] dsisconnected')
    const embed = new EmbedBuilder()
      .setDescription(
        'Disconnected from voice channel (queue cleared if there is any)',
      )
      .setColor('#FF0000')
    const embedMessage = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    })
    // Delete the embed message after 5 seconds
    setTimeout(() => {
      embedMessage.delete()
    }, 5000)

    return
  } else {
    console.log(1)
  } */
}
