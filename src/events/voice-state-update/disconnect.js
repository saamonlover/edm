const { EmbedBuilder } = require('discord.js')

module.exports = async (client, oldState, newState) => {
  const guildId = oldState.guild.id
  const local = require('../../events/ready/00-register-local-vars')(guildId)

  // Check if the bot was disconnected from the voice channel
  if (
    oldState.member.id === client.user.id &&
    oldState.channelId &&
    !newState.channelId
  ) {
    // Set global.connection back to null and stop the player
    // Since player stop operation actually sklips to the next item in queue
    // Need to clear the queue as well
    local.connection = null
    local.tracks = []
    if (local.player) {
      local.player.stop()
    }

    console.log('> [voice-state-update] dsisconnected')

    const embed = new EmbedBuilder()
    if (local.player.state.status === 'idle') {
      embed
        .setDescription(
          `${global.disconnectIcon}  Disconnected due to inactivity`,
        )
        .setColor(process.env.SECONDARY_COLOR)
    } else {
      embed
        .setDescription(
          `${global.disconnectIcon}  Queue emptied due to disconnection`,
        )
        .setColor(process.env.SECONDARY_COLOR)
    }
    if (local.inter) {
      return local.inter.channel.send({ embeds: [embed] })
    }
  }
}
