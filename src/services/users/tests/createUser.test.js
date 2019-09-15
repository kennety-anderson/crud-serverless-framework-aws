'use strict'

// requires do test
const mongoose = require('mongoose')
const mockingoose = require('mockingoose').default
const { createConnection } = require('../../../database/mongo/connection')
const { handler } = require('../endpoints/createUser')
const User = require('../../../database/mongo/models/User')

// mock opcional pois require do mockingoose ja mock a conexão
jest.mock('../../../database/mongo/connection')

describe('Create user:', () => {
  const _id = new mongoose.Types.ObjectId().toHexString()
  const user = {
    _id,
    name: 'kenny',
    email: 'kem@gmail.com',
    cpf: '01234567891',
    password: '12345678',
    birthDate: '01/01/2000'
  } // exemplo de um objeto de cadastro de user

  const context = {}

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  beforeAll(() => {
    createConnection.mockImplementation(() => Promise.resolve(true))
  })

  test('verify user ceated successfully:', async done => {
    mockingoose(User).toReturn(user, 'save') // simula o metodo save do user
    const event = { body: { ...user } }

    const result = await handler(event, context)

    console.log(result.body, 'log result.body')

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('_id')
    done()
  })
})
