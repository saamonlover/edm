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

    let tracks = []
    // Track URL
    if (input.includes('spotify.com/track/')) {
      const trackId = input.split('spotify.com/track/')[1].split('?')[0]
      const trackData = await spotifyApi.getTrack(trackId)
      tracks.push(trackData.body)
    }
    // Playlist URL
    else if (input.includes('spotify.com/playlist/')) {
      const playlistId = input.split('spotify.com/playlist/')[1].split('?')[0]
      const playlistData = await spotifyApi.getPlaylist(playlistId)
      const playlistTracks = playlistData.body.tracks.items
      tracks = playlistTracks.map((item) => item.track)
    }
    // Track w/ song name and artist
    else {
      const searchResult = await spotifyApi.searchTracks(input)
      tracks.push(searchResult.body.tracks.items[0])
    }

    if (tracks.length === 0) {
      return interaction.reply('No tracks were found!')
    }

    // Play all tracks added
    let count = 1
    let connection
    for (const track of tracks) {
      // Get the track's meta
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

      // On first track
      if (count === 1) {
        // Defer interaction reply
        await interaction.deferReply()

        // Join the voice channel
        const channel = interaction.member.voice.channel
        if (!channel) {
          return interaction.editReply(
            'You must be in a voice channel to play music!',
          )
        }
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        })

        count++
      }

      // Play the track
      const stream = await play.stream(ytTrackUrl)
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      })
      let player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      })
      player.play(resource)
      connection.subscribe(player)

      // Interaction reply
      const embed = new EmbedBuilder()
        .setDescription(`Now playing [${track.name}](${trackUrl})`)
        .setColor('#FF0000')
      await interaction.editReply({ embeds: [embed] })

      // Wait for the song to finish
      await new Promise((resolve) => player.on('idle', resolve))
    }
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
