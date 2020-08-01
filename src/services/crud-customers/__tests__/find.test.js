const mongoose = require('mongoose')
const mockingoose = require('mockingoose').default
const { createConnection } = require('../../../database/mongo/connection')
const { handler } = require('../endpoints/find')
const Customer = require('../../../database/mongo/models/Customer')

jest.mock('../../../database/mongo/connection')

describe('Find and list customer', () => {
  const _id = new mongoose.Types.ObjectId().toHexString()

  const customer = {
    _id,
    name: 'kenny',
    email: 'kem@gmail.com',
    cpf: '01234567891',
    password: '12345678',
    birthDate: '01/01/2000'
  }

  const context = {}

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  beforeAll(() => {
    createConnection.mockImplementation(() => Promise.resolve(true))
  })

  it('list total customer:', async done => {
    const data = [customer]
    const event = {}

    mockingoose(Customer).toReturn(data, 'find')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body).data).toHaveLength(1)
    done()
  })

  it('finding customer error', async done => {
    const event = { queryStringParameters: {} }

    mockingoose(Customer).toReturn(new Error('Timeout'), 'find')

    try {
      await handler(event, context)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }

    done()
  })
})
