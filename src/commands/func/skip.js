const { EmbedBuilder } = require('discord.js')
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
} = require('@discordjs/voice')

const YouTube = require('youtube-sr').default

const play = require('play-dl')

module.exports = {
  callback: async (_, interaction) => {
    if (global.tracks.length === 0) {
      const embed = new EmbedBuilder()
        .setDescription('Queue is empty')
        .setColor('#FF0000')
      return interaction.reply({ embeds: [embed] })
    }

    // Head to the next track
    /* global.player.stop() */

    // Defer interaction reply
    await interaction.deferReply()

    // Play all tracks added
    while (global.tracks.length > 0) {
      // Get the next track
      const track = global.tracks.shift()
      const trackUrl = track.external_urls.spotify
      const trackName = track.name
      const artistName = track.artists[0].name

      // Search on YouTube Music
      const searchQuery = `${trackName} ${artistName} audio`
      const ytSearchResult = await YouTube.search(searchQuery, {
        limit: 1,
        safeSearch: true,
      })
      const ytTrackUrl = `https://music.youtube.com/watch?v=${ytSearchResult[0].id}`

      // Check if the bot is in a voice channel
      if (!global.connection) {
        // Join the voice channel
        const channel = interaction.member.voice.channel
        if (!channel) {
          return interaction.editReply(
            'You must be in a voice channel to play music!',
          )
        }
        global.connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        })
      }

      // Play the track
      const stream = await play.stream(ytTrackUrl)
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      })
      global.player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      })
      global.player.play(resource)
      global.connection.subscribe(global.player)

      // Interaction reply
      const embed = new EmbedBuilder()
        .setDescription(
          `Now playing [${trackName} - ${artistName}](${trackUrl})`,
        )
        .setColor('#FF0000')
      await interaction.editReply({ embeds: [embed] })

      // Wait for the song to finish
      await new Promise((resolve) => global.player.on('idle', resolve))
    }
  },
  data: {
    name: 'skip',
    description: 'Skip the current track',
  },
}
