const { EmbedBuilder } = require('discord.js')
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
} = require('@discordjs/voice')

const SpotifyWebApi = require('spotify-web-api-node')
const YouTube = require('youtube-sr').default

const play = require('play-dl')

module.exports = {
  callback: async (_, interaction) => {
    // Establish Spotify API connection
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    })

    // Retrieve an access token
    const data = await spotifyApi.clientCredentialsGrant()
    const accessToken = data.body['access_token']
    spotifyApi.setAccessToken(accessToken)

    // Get search input
    const song = interaction.options.getString('song')
    const url = interaction.options.getString('url')
    const input = song || url

    // Track URL
    if (input.includes('spotify.com/track/')) {
      const trackId = input.split('spotify.com/track/')[1].split('?')[0]
      const trackData = await spotifyApi.getTrack(trackId)
      global.tracks.push(trackData.body)
    }
    // Playlist URL
    else if (input.includes('spotify.com/playlist/')) {
      const playlistId = input.split('spotify.com/playlist/')[1].split('?')[0]
      let hasNextPage = true
      let offset = 0

      while (hasNextPage) {
        const playlistData = await spotifyApi.getPlaylistTracks(playlistId, {
          offset,
        })
        const playlistTracks = playlistData.body.items
        global.tracks.push(...playlistTracks.map((item) => item.track))

        offset += playlistTracks.length
        hasNextPage = playlistData.body.next !== null
      }
    }
    // Track w/ song name and artist
    else {
      const searchResult = await spotifyApi.searchTracks(input)
      global.tracks.push(searchResult.body.tracks.items[0])
    }

    if (global.tracks.length === 0) {
      return interaction.reply('No tracks were found!')
    }

    // Check if a song is currently playing
    if (global.connection) {
      console.log('> [play] track(s) added')
      const embed = new EmbedBuilder()
        .setDescription(`${global.addedIcon}  Track(s) added to the queue`)
        .setColor(process.env.SECONDARY_COLOR)
      const embedMessage = await interaction.reply({
        embeds: [embed],
        fetchReply: true,
      })
      // Delete the embed message after 5 seconds
      setTimeout(() => {
        embedMessage.delete()
      }, 5000)

      return
    }

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
          `${global.playingIcon}  Now playing **[${trackName} by ${artistName}](${trackUrl})**`,
        )
        .setColor(process.env.PRIMARY_COLOR)
      await interaction.editReply({ embeds: [embed] })

      // Wait for the song to finish
      await new Promise((resolve) => global.player.on('idle', resolve))
    }

    // When queue is empty
    if (global.connection) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${global.stoppedIcon}  Finished playing all songs in queue`,
        )
        .setColor(process.env.PRIMARY_COLOR)
      await interaction.editReply({ embeds: [embed] })
    } else {
      const embed = new EmbedBuilder()
        .setDescription(
          `${global.disconnectIcon}  Manually disconnected, queue emptied`,
        )
        .setColor(process.env.SECONDARY_COLOR)
      await interaction.editReply({ embeds: [embed] })
    }

    // Auto disconnect after 1 minute
    setTimeout(async () => {
      if (global.connection) {
        global.connection.destroy()
        global.connection = null
        global.tracks = []
        global.player.stop()

        // Interaction reply
        const embed = new EmbedBuilder()
          .setDescription(
            `${global.disconnectIcon}  Disconnected due to inactivity`,
          )
          .setColor(process.env.SECONDARY_COLOR)
        await interaction.followUp({ embeds: [embed] })
      }
    }, 60000)
  },
  data: {
    name: 'play',
    description: 'Play a song',
    options: [
      {
        type: 3,
        name: 'song',
        description: 'Song name and artist',
        required: false,
      },
      {
        type: 3,
        name: 'url',
        description: 'Spotify URL',
        required: false,
      },
    ],
  },
}
