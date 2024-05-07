const { EmbedBuilder } = require('discord.js')

module.exports = {
  callback: async (_, interaction) => {
    const guildId = interaction.guild.id
    const local = require('../../events/ready/00-register-local-vars')(guildId)

    if (local.tracks.length === 0) {
      const embed = new EmbedBuilder()
        .setDescription(`${global.emptyIcon}  Queue is empty`)
        .setColor(process.env.SECONDARY_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    // Head to the next track
    local.player.stop()

    // Interaction reply
    const embed = new EmbedBuilder()
      .setDescription(`${global.skipIcon}  Current song skipped`)
      .setColor(process.env.PRIMARY_COLOR)
    await interaction.reply({ embeds: [embed] })
  },
  data: {
    name: 'skip',
    description: 'Skip the current song',
  },
}
