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
  callback: async (client, interaction) => {
    // Establish Spotify API connection
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    })

    // Retrieve an access token
    const data = await spotifyApi.clientCredentialsGrant()
    const accessToken = data.body['access_token']
    spotifyApi.setAccessToken(accessToken)

    // Search for the track
    const track = interaction.options.getString('x')
    let firstTrack
    if (track.includes('spotify.com/track/')) {
      const trackId = track.split('spotify.com/track/')[1].split('?')[0]
      const trackData = await spotifyApi.getTrack(trackId)
      firstTrack = trackData.body
    } else {
      const searchResult = await spotifyApi.searchTracks(track)
      firstTrack = searchResult.body.tracks.items[0]
    }

    if (!firstTrack) {
      return interaction.reply('No tracks were found!')
    }

    // Get the track's URL
    const trackUrl = firstTrack.external_urls.spotify
    const trackName = firstTrack.name
    const artistName = firstTrack.artists[0].name

    // Search on YouTube Music
    const searchQuery = `${trackName} ${artistName} audio`
    const ytSearchResult = await YouTube.search(searchQuery, {
      limit: 1,
      safeSearch: true,
    })
    const ytTrackUrl = `https://music.youtube.com/watch?v=${ytSearchResult[0].id}`

    // Defer the reply
    await interaction.deferReply()

    // Join the voice channel
    const channel = interaction.member.voice.channel
    if (!channel) {
      return interaction.editReply(
        'You must be in a voice channel to play music!',
      )
    }
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    })

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
      .setDescription(`Playing [${firstTrack.name}](${trackUrl})`)
      .setColor('#FF0000')
    await interaction.editReply({ embeds: [embed] })
  },
  data: {
    name: 'play',
    description: 'Play a song',
    options: [
      {
        type: 3,
        name: 'x',
        description: 'Song name / track url',
        required: true,
      },
    ],
  },
}
