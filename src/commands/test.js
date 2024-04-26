const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (client, interaction) => {
    // Interaction reply
    const embed = new EmbedBuilder()
      .setTitle('Test command')
      .setDescription('This is a test command.')
      .setColor('#FF0000')
      .setTimestamp()
      .setFooter('Test command')
    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'test',
    description: 'A test command',
  },
}
