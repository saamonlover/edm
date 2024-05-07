// Create a Map to hold a local object for each server
const guilds = new Map()

// Export a function that takes a guild ID and returns the local object for that server
module.exports = function (guildId) {
  // If the Map doesn't have a local object for this server, create one
  if (!guilds.has(guildId)) {
    guilds.set(guildId, {
      inter: null,
      connection: null,
      player: null,
      tracks: [],
      currentQueuePage: null,
    })
  }

  // Return the local object for this server
  return guilds.get(guildId)
}
