'use strict'

const AWS = require('aws-sdk')
const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const httpErrorHandler = require('@middy/http-error-handler')
const jsonBodyParser = require('@middy/http-json-body-parser')
const urlEncodeBodyParser = require('@middy/http-urlencode-body-parser')
const createError = require('http-errors')
const { createConnection } = require('../../../database/mongo/connection')
const User = require('../../../database/mongo/models/User')

const sns = new AWS.SNS()

const handler = middy(async (event, context) => {
  const body = event.body

  try {
    await createConnection() // criando conexão com o banco de dados

    const data = await User.create(body)

    return {
      statusCode: 200,
      body: JSON.stringify({
        _id: data._id
      })
    }
  } catch (err) {
    console.log(err)
    // criação de um erro no formato http
    throw createError(400)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(httpErrorHandler()) // valida qualquer erro do formato http-errors
  .use(jsonBodyParser()) // parseia o body em formato json
  .use(urlEncodeBodyParser({ extended: true })) // parseia a url em formato json

module.exports = { handler }
