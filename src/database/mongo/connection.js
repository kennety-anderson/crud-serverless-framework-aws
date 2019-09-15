const { connect, connection } = require('mongoose')

let hasConnection = false

const createConnection = async (uri = process.env.MONGO_URI) => {
  if (hasConnection) return

  console.log(process.env.MONGO_URI)

  const connection = await connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    reconnectTries: 100,
    reconnectInterval: 1000,
    bufferCommands: false,
    bufferMaxEntries: 0,
    keepAlive: true
  }, (err) => {
    if (err) {
      console.log(`========= erro de conexão do mongo 
            ${err}`)
    }
  })

  hasConnection = true
  return connection
}

const closeConnection = () => {
  connection.close()
}

connection.on('connected', () => console.log('Mongo conectado'))

connection.on('disconnected', () => {
  console.log('Mongo desconectado')
  hasConnection = false
})

module.exports = { createConnection, closeConnection }
