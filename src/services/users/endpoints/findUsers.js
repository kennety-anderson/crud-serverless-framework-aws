'use strict'

const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const httpErrorHandler = require('@middy/http-error-handler')
const createError = require('http-errors')
const { createConnection } = require('../../../database/mongo/connection')
const User = require('../../../database/mongo/models/User')

const handler = middy(async (event, context) => {
  try {
    await createConnection()

    const data = await User.find()

    return {
      statusCode: 200,
      body: JSON.stringify({
        users: data
      })
    }
  } catch (err) {
    console.log(`=========
        ${err}`)
    throw createError(500)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop())
  .use(warmup({ waitForEmptyEventLoop: false }))
  .use(httpErrorHandler())

module.exports = { handler }
