'use strict'

const AWS = require('aws-sdk')
const middy = require('@middy/core')
const doNotWaitForEmptyEventLoop = require('@middy/do-not-wait-for-empty-event-loop')
const warmup = require('@middy/warmup')
const cors = require('@middy/http-cors')
const httpErrorHandler = require('@middy/http-error-handler')
const CreateError = require('http-errors')
const { createConnection } = require('../../../database/mongo/connection')
const Customer = require('../../../database/mongo/models/Customer')

const sns = new AWS.SNS()

const handler = middy(async (event, context) => {
  const body = JSON.parse(event.body)

  try {
    await createConnection() // criando conexão com o banco de dados

    const data = await Customer.create(body)

    const params = {
      Message: JSON.stringify(data),
      TopicArn: process.env.SNS_TOPIC_CUSTOMER_CREATE
    }

    await sns.publish(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        data
      })
    }
  } catch (err) {
    // verifica se é um erro de validação para dar uma resposta persoanlizada ao cliente
    if (err.name === 'ValidationError') {
      throw new CreateError(
        400,
        'Erro de validação verifique os campos enviados'
      )
    }

    // verificação de erro de chave duplicada
    if (err.name === 'MongoError' && err.code === 11000) {
      throw new CreateError(422, 'Email já existente!')
    }

    // criação de um erro de requisição mal formada
    throw new CreateError(400)
  }
})

handler
  .use(doNotWaitForEmptyEventLoop()) // adiciona o context.doNotWaitForEmptyEventLoop = false
  .use(warmup({ waitForEmptyEventLoop: false })) // retorna de forma rapida quando é um evento warmup
  .use(httpErrorHandler()) // valida qualquer erro do formato http-errors
  .use(cors()) // adiciona os headers do cors (tem que ser antes do response)

module.exports = { handler }
