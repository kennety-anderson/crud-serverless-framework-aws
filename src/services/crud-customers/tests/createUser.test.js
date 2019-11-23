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
    birthDate: '2000-01-01'
  } // exemplo de um objeto de cadastro de user

  const context = {}

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  beforeAll(() => {
    createConnection.mockImplementation(() => Promise.resolve())
  })

  it('verify user ceated successfully:', async done => {
    mockingoose(User).toReturn(user, 'save') // simula o metodo save do user
    const event = { body: { ...user } }

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('_id')
    done()
  })

  it('testing creation driver error', async done => {
    const context = {}
    const event = { body: user } // sem stringify

    const err = new mongoose.Error.ValidationError()

    mockingoose(User).toReturn(err, 'save')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 400)
    expect(result).toHaveProperty('body')
    done()
  })

  it('create user error', async done => {
    const event = { body: { ...user } }

    mockingoose(User).toReturn(new Error('Timeout'), 'save')

    try {
      await handler(event, context)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }

    done()
  })
})
