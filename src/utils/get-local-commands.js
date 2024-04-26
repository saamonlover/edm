const path = require('path')
const getAllFiles = require('./get-all-files')

module.exports = (exceptions) => {
  let localCommands = []

  const commandCategories = getAllFiles(
    path.join(__dirname, '..', 'commands'),
    true,
  )

  for (const commandCategory of commandCategories) {
    const subCategories = getAllFiles(commandCategory, true)

    for (const subCategory of subCategories) {
      const commandFiles = getAllFiles(subCategory)

      for (const commandFile of commandFiles) {
        const commandObject = require(commandFile)
        localCommands.push(commandObject)
      }
    }
  }

  return localCommands
}
