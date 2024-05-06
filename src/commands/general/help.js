const { EmbedBuilder } = require('discord.js')
const getApplicatinoCommands = require('../../utils/get-application-commands')

module.exports = {
  callback: async (client, interaction) => {
    const commandManager = await getApplicatinoCommands(client)
    const commands = await commandManager.fetch()

    const commandList = commands
      .map((command) => `**/${command.name}** - ${command.description}\n\u200B`)
      .join('\n')

    const embed = new EmbedBuilder()
      .setTitle('Available commands\n\u200B')
      .setDescription(commandList)
      .setColor(process.env.PRIMARY_COLOR)

    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'help',
    description: 'Show the list of available commands',
  },
}
