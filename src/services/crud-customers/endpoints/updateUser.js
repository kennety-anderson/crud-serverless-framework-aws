const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const cors = require('@middy/http-cors')
const httpErroHandler = require('@middy/http-error-handler')
const jsonBodyParser = require('@middy/http-json-body-parser')
const urlEncodeBodyParser = require('@middy/http-urlencode-body-parser')
const validator = require('@middy/validator')
const jsonRequest = require('../../../../models/users/requests/update.json')
const createError = require('http-errors')
const { ObjectId } = require('mongodb')
const { createConnection } = require('../../../database/mongo/connection')
const User = require('../../../database/mongo/models/User')

const handler = middy(async (event, context) => {
  const { id } = event.pathParameters
  const body = event.body

  try {
    await createConnection()

    if (!ObjectId.isValid(id)) throw createError(422, 'ID malformed')

    const data = await User.findOneAndUpdate({ _id: id }, body, { new: true })

    if (!data) throw createError(404, 'User is not found!')

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: data
      })
    }
  } catch (err) {
    if (err.statusCode && err.message) {
      throw createError(err.statusCode, err.message)
    }

    // criação de um erro de requisição mal formada
    throw createError(500)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(cors()) // adiciona os headers do cors (tem que ser antes do response)
  .use(httpErroHandler()) // valida qualquer erro do formato http-errors
  .use(jsonBodyParser()) // parseia o body em formato json
  .use(urlEncodeBodyParser({ extended: true })) // parseia a url em formato json
  .use(validator({ inputSchema: jsonRequest })) // faz uma validação dos dados de entrada atraves de um jsonSchema

module.exports = { handler }
