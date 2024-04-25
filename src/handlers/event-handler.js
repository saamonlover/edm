const path = require('path')
const getAllFiles = require('../utils/get-all-files')

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true)

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder)
    eventFiles.sort((a, b) => a > b)

    // Convert kebab case to camel case for the event names
    const eventName = eventFolder
      .replace(/\\/g, '/')
      .split('/')
      .pop()
      .split('-')
      .map((word, index) => {
        if (index === 0) return word
        return word[0].toUpperCase() + word.slice(1)
      })
      .join('')

    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        // Avoid running schema tests
        if (eventFile.endsWith('schema-tests.js')) continue

        const eventFunction = require(eventFile)
        await eventFunction(client, arg)
      }
    })
  }
}
