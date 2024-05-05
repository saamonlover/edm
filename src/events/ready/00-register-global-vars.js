module.exports = async (client) => {
  global.connection
  global.player
  global.tracks = []
  global.currentQueuePage

  // Get guild
  const guild = client.guilds.cache.get(process.env.GUILD_ID)

  // Emojis
  const emojis = guild.emojis.cache
  global.playingIcon = emojis.find((emoji) => emoji.name === 'EDMPlayingIcon')
  global.stoppedIcon = emojis.find((emoji) => emoji.name === 'EDMStoppedIcon')
  global.disconnectIcon = emojis.find(
    (emoji) => emoji.name === 'EDMDisconnectIcon',
  )
  global.addedIcon = emojis.find((emoji) => emoji.name === 'EDMAddedIcon')
  global.errorIcon = emojis.find((emoji) => emoji.name === 'EDMErrorIcon')
  global.shuffleIcon = emojis.find((emoji) => emoji.name === 'EDMShuffleIcon')
  global.emptyIcon = emojis.find((emoji) => emoji.name === 'EDMEmptyIcon')
  global.skipIcon = emojis.find((emoji) => emoji.name === 'EDMSkipIcon')
  global.queueIcon = emojis.find((emoji) => emoji.name === 'EDMQueueIcon')
  global.jumptoIcon = emojis.find((emoji) => emoji.name === 'EDMJumptoIcon')
  global.removeIcon = emojis.find((emoji) => emoji.name === 'EDMRemoveIcon')
}
