const getLocalCommands = require('../../utils/get-local-commands')

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return

  const localCommands = getLocalCommands()

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.data.name === interaction.commandName,
    )

    if (!commandObject) return

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me
        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: "I don't have enough permission.",
            // ephemeral: true,
          })
          break
        }
      }
    }
    await commandObject.callback(client, interaction)
  } catch (error) {
    console.log(`There was an error running this command: ${error}.`)
  }
}
