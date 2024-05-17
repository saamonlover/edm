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
    const guildId = interaction.guild.id
    const local = require('../../events/ready/00-register-local-vars')(guildId)
    const head = interaction.options.getBoolean('head')

    local.inter = interaction

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
    const input = interaction.options.getString('input')

    try {
      // Track URL
      if (input.includes('spotify.com/track/')) {
        const trackId = input.split('spotify.com/track/')[1].split('?')[0]
        const trackData = await spotifyApi.getTrack(trackId)

        if (head) local.tracks.unshift(trackData.body)
        else local.tracks.push(trackData.body)
      }
      // Album URL
      else if (input.includes('spotify.com/album/')) {
        const albumId = input.split('spotify.com/album/')[1].split('?')[0]
        const albumData = await spotifyApi.getAlbum(albumId)
        const albumTracks = albumData.body.tracks.items

        if (head) local.tracks.unshift(...albumTracks)
        else local.tracks.push(...albumTracks)
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

          if (head)
            local.tracks.unshift(...playlistTracks.map((item) => item.track))
          else local.tracks.push(...playlistTracks.map((item) => item.track))

          offset += playlistTracks.length
          hasNextPage = playlistData.body.next !== null
        }
      }
      // Track w/ song name and artist
      else {
        const searchResult = await spotifyApi.searchTracks(input)
        if (head) local.tracks.unshift(searchResult.body.tracks.items[0])
        else local.tracks.push(searchResult.body.tracks.items[0])
      }
    } catch (error) {
      console.log(`> [play] error: ${error.message} (${guildId})`)
      const embed = new EmbedBuilder()
        .setDescription(`${global.errorIcon}  Error adding song`)
        .setColor(process.env.ERROR_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    // Not sure if still needed
    if (local.tracks.length === 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${global.errorIcon}  Please ensure a song or url is requested`,
        )
        .setColor(process.env.ERROR_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    // Check if a song is currently playing
    if (local.connection && local.player.state.status === 'playing') {
      console.log(`> [play] track(s) added (${guildId})`)
      const embed = new EmbedBuilder()
        .setDescription(`${global.addedIcon}  Track(s) added to the queue`)
        .setColor(process.env.SECONDARY_COLOR)
      return interaction.reply({ embeds: [embed] })
    }

    // Deferring the interaction
    await interaction.deferReply()

    local.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    })

    let isFirstIteraction = true

    // Play all tracks added
    while (local.tracks.length > 0) {
      // Get the next track
      const track = local.tracks.shift()
      const trackUrl = track.external_urls.spotify
      const trackName = track.name
      // const artistName = track.artists[0].name
      const artistNames = track.artists.map((artist) => artist.name).join(', ')

      // Search on YouTube Music
      const searchQuery = `"${trackName}" "${artistNames}" audio`
      const ytSearchResult = await YouTube.search(searchQuery, {
        limit: 1,
        safeSearch: true,
      })
      const ytTrackUrl = `https://music.youtube.com/watch?v=${ytSearchResult[0].id}`

      // Check if the bot is in a voice channel
      if (!local.connection) {
        // Join the voice channel
        const channel = interaction.member.voice.channel
        if (!channel) {
          const embed = new EmbedBuilder()
            .setDescription(
              `${global.errorIcon}  Please join a voice channel first`,
            )
            .setColor(process.env.ERROR_COLOR)
          return interaction.editReply({ embeds: [embed] })
        }
        local.connection = joinVoiceChannel({
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
      local.player.play(resource)
      local.connection.subscribe(local.player)
      console.log(`> [play] started playing (${guildId})`)

      // Interaction reply
      const embed = new EmbedBuilder()
        .setDescription(
          `${global.playingIcon}  Started playing **[${trackName} by ${artistNames}](${trackUrl})**`,
        )
        .setColor(process.env.PRIMARY_COLOR)

      if (isFirstIteraction) {
        await interaction.editReply({ embeds: [embed] })
        isFirstIteraction = false
      } else {
        await interaction.channel.send({ embeds: [embed] })
      }

      // Wait for the song to finish
      await new Promise((resolve) => local.player.once('idle', resolve))
    }

    // When queue is empty
    if (local.connection && local.tracks.length === 0) {
      console.log(`> [play] finished playing (${guildId})`)
      const embed = new EmbedBuilder()
        .setDescription(
          `${global.stoppedIcon}  Finished playing all songs in queue`,
        )
        .setColor(process.env.PRIMARY_COLOR)
      await interaction.channel.send({ embeds: [embed] })
    }

    // Auto disconnect after 1 minute
    setTimeout(async () => {
      if (local.connection && local.player.state.status === 'idle') {
        local.connection.destroy()
      }
    }, 60000)
  },
  data: {
    name: 'play',
    description: 'Play a song',
    options: [
      {
        type: 3,
        name: 'input',
        description: 'Song name and artist / Spotify URL',
        required: true,
      },
      {
        type: 5,
        name: 'head',
        description: 'Add track to the head of the queue',
        required: false,
      },
    ],
  },
}
