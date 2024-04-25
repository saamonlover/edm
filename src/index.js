require('dotenv').config({ path: '.env' })
const { Client, IntentsBitField } = require('discord.js')
const eventHandlers = require('./handlers/event-handler')

const client = new Client({
  // Declare intents for authorized events
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
})

;(async () => {
  try {
    eventHandlers(client)

    client.login(process.env.BOT_TOKEN)
  } catch (error) {
    console.log('> src/index.js [err]: error with db')
  }
})()
