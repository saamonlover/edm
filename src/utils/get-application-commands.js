module.exports = async (client) => {
  const applicationCommands = await client.application.commands
  await applicationCommands.fetch()
  return applicationCommands
}
