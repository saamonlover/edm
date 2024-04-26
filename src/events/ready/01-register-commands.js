const areCommandsDifferent = require('../../utils/are-commands-different')
const getApplicationCommands = require('../../utils/get-application-commands')
const getLocalCommands = require('../../utils/get-local-commands')

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands()
    const applicationCommands = await getApplicationCommands(client)

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand.data
      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name,
      )
      if (existingCommand) {
        if (localCommand.data.deleted) {
          await applicationCommands.delete(existingCommand.id)
          console.log(`> [][log] deleted command: "${name}".`)
          continue
        }
        if (areCommandsDifferent(existingCommand, localCommand.data)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          })
          console.log(`> [][log] edited command: "${name}".`)
        }
      } else {
        if (localCommand.data.deleted) {
          console.log(
            `> [note]: skipping registering command "${name}" as it's set to deleted.`,
          )
          continue
        }
        await applicationCommands.create({ name, description, options })
        console.log(`> [update]: registered command: "${name}".`)
      }
    }
  } catch (error) {
    console.error(`> [err]: there was an error ${error}`)
  }
}
