const { connect, connection } = require('mongoose')
const createError = require('http-errors')

let hasConnection = false

const createConnection = async (uri = process.env.MONGO_URI) => {
  if (hasConnection) return

  console.log(process.env.MONGO_URI)

  const connection = await connect(
    uri,
    {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      reconnectTries: 100,
      reconnectInterval: 1000,
      bufferCommands: false,
      bufferMaxEntries: 0,
      keepAlive: true
    },
    err => {
      if (err) {
        console.log(`Erro de conexão mongo ${err}`)
        // criar resposta de erro para um erro de conexão
        throw createError(500)
      }
    }
  )

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
