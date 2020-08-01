// requires do test
const mongoose = require('mongoose')
const mockingoose = require('mockingoose').default
const { createConnection } = require('../../../database/mongo/connection')
const { handler } = require('../endpoints/delete')
const Customer = require('../../../database/mongo/models/Customer')
const { ObjectId } = require('mongodb')
const createError = require('http-errors')

jest.mock('../../../database/mongo/connection')

describe('Test to delete customer:', () => {
  const _id = new mongoose.Types.ObjectId()
  const customer = {
    _id,
    name: 'kenny',
    email: 'kem@gmail.com',
    cpf: '01234567891',
    password: '12345678',
    birthDate: '01/01/2000'
  } // exemplo de um objeto de cadastro de Customer

  const context = {}

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  beforeAll(() => {
    createConnection.mockImplementation(() => Promise.resolve())
  })

  it('test delete customer successfully:', async done => {
    const event = { pathParameters: { id: _id } }
    console.log(event)

    mockingoose(Customer).toReturn(customer, 'findOneAndDelete')

    const result = await handler(event, context)

    console.log('body', result.body)

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('data')
    done()
  })

  it('received id malformed:', async done => {
    let id = 'abc'
    const event = { pathParameters: { id } }

    if (ObjectId.isValid(id)) {
      mockingoose(Customer).toReturn({ id: 1 }, 'findOneAndDelete')
    } else {
      mockingoose(Customer).toReturn(createError(422), 'findOneAndDelete')
    }

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 422)
    done()
  })

  it('Customer is not found:', async done => {
    const id = 1
    const event = { pathParameters: { id } }

    mockingoose(Customer).toReturn(null, 'findOneAndDelete')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 404)
    done()
  })

  it('timeout error:', async done => {
    const event = { pathParameters: { id: _id } }

    mockingoose(Customer).toReturn(new Error('Timeout'), 'findOneAndDelete')

    try {
      await handler(event, context)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }

    done()
  })
})
