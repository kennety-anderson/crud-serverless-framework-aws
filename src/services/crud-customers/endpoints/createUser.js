'use strict'

const AWS = require('aws-sdk')
const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const urlEncodeBodyParser = require('@middy/http-urlencode-body-parser')
const validator = require('@middy/validator')
const jsonRequest = require('../../../../models/customers/requests/create.json')
const createError = require('http-errors')
const { createConnection } = require('../../../database/mongo/connection')
const User = require('../../../database/mongo/models/User')

const sns = new AWS.SNS()

const handler = middy(async (event, context) => {
  const body = JSON.parse(event.body)

  try {
    await createConnection() // criando conexão com o banco de dados

    const data = await User.create(body)

    const params = {
      Message: JSON.stringify(data),
      TopicArn: process.env.SNS_TOPIC_CUSTOMER_CREATE
    }

    await sns.publish(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        _id: data._id
      })
    }
  } catch (err) {
    // erifica se é um erro de validação para dar uma resposta persoanlizada ao cliente
    if (err.name === 'ValidationError') {
      throw createError(400, 'Erro de validação verifique os campos enviados')
    }

    // criação de um erro de requisição mal formada
    throw createError(400)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(cors()) // adiciona os headers do cors (tem que ser antes do response)
  .use(httpErrorHandler()) // valida qualquer erro do formato http-errors
  .use(urlEncodeBodyParser({ extended: true })) // parseia a url em formato json
  .use(validator({ inputSchema: jsonRequest })) // faz uma validação dos dados de entrada atraves de um jsonSchema

module.exports = { handler }
