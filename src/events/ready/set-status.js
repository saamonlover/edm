const { ActivityType } = require('discord.js')

let status = {
  type: ActivityType.Custom,
  name: `/help for all commands`,
}

module.exports = async (client) => {
  await client.user.setActivity(status)
}
