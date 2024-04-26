const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (client, interaction) => {
    // Interaction reply
    const embed = new EmbedBuilder()
      .setDescription('This is a test command.')
      .setColor('#FF0000')
    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'test',
    description: 'A test command',
  },
}
