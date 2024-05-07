const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    const guildId = interaction.guild.id
    const local = require('../../events/ready/00-register-local-vars')(guildId)

    local.tracks = []
    const embed = new EmbedBuilder()
      .setDescription(`${global.emptyIcon}  Queue is empty now`)
      .setColor(process.env.SECONDARY_COLOR)
    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'clear',
    description: 'Clear the current queue',
  },
}
