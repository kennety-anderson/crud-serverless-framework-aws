const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
// const warmup = require('@middy/warmup')
const httpErroHandler = require('@middy/http-error-handler')
const jsonBodyParser = require('@middy/http-json-body-parser')
const urlEncodeBodyParser = require('@middy/http-urlencode-body-parser')
const createError = require('http-errors')
const { ObjectId } = require('mongodb')
const { createConnection } = require('../../../database/mongo/connection')
const User = require('../../../database/mongo/models/User')

const handler = middy(async (event, context) => {
  try {
    await createConnection()

    const { id } = event.pathParameters
    const body = event.body

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
    if (err.statusCode) throw createError(err.statusCode, err.message)

    throw createError(500)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop())
  // .use(warmup({ waitForEmptyEventLoop: false }))
  .use(httpErroHandler())
  .use(jsonBodyParser())
  .use(urlEncodeBodyParser({ extended: true }))

module.exports = { handler }
