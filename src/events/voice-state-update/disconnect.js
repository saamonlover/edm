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

    const embed = new EmbedBuilder()
    if (global.player.state.status === 'idle') {
      embed
        .setDescription(
          `${global.disconnectIcon}  Disconnected due to inactivity`,
        )
        .setColor(process.env.SECONDARY_COLOR)
    } else {
      embed
        .setDescription(
          `${global.disconnectIcon}  Manually disconnected, queue emptied`,
        )
        .setColor(process.env.SECONDARY_COLOR)
    }
    if (global.interaction) {
      return global.interaction.channel.send({ embeds: [embed] })
    }
  }
}
