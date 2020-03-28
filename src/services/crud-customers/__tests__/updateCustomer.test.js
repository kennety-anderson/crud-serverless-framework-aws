// requires do test
const mongoose = require('mongoose')
const mockingoose = require('mockingoose').default
const { createConnection } = require('../../../database/mongo/connection')
const { handler } = require('../endpoints/updateCustomer')
const Customer = require('../../../database/mongo/models/Customer')
const { ObjectId } = require('mongodb')
const mongodb = require('mongodb')
const createError = require('http-errors')

// mock opcional pois require do mockingoose ja mock a conexão
jest.mock('../../../database/mongo/connection')

jest.mock('aws-sdk', () => {
  return {
    SNS: function () {
      return {
        publish: () => {
          return {
            promise: () => {}
          }
        }
      }
    }
  }
})

describe('Test update customer:', () => {
  const _id = new mongoose.Types.ObjectId()
  const customer = {
    _id,
    name: 'kenny',
    email: 'kem@gmail.com',
    cpf: '01234567891',
    password: '12345678',
    birthDate: '2000-01-01'
  } // exemplo de um objeto de cadastro de customer

  const context = {}

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  beforeAll(() => {
    createConnection.mockImplementation(() => Promise.resolve(true))
  })

  it('update as successfully:', async done => {
    const event = {
      pathParameters: { id: _id },
      body: JSON.stringify(customer)
    }

    mockingoose(Customer).toReturn(customer, 'findOneAndUpdate')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('data')
    done()
  })

  it('received id malformed:', async done => {
    let id = 'abc'
    const event = { pathParameters: { id }, body: { ...Customer } }

    if (ObjectId.isValid(id)) {
      mockingoose(Customer).toReturn({ id: 1 }, 'findOneAndUpdate')
    } else {
      mockingoose(Customer).toReturn(createError(422), 'findOneAndUpdate')
    }

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 422)
    done()
  })

  it('Customer is not found:', async done => {
    const id = 1
    const event = { pathParameters: { id }, body: { ...customer } }

    mockingoose(Customer).toReturn(null, 'findOneAndUpdate')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 404)
    done()
  })

  it('timeout error:', async done => {
    const event = { pathParameters: { id: _id } }

    mockingoose(Customer).toReturn(new Error('Timeout'), 'findOneAndUpdate')

    try {
      await handler(event, context)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }

    done()
  })

  it('internal server error:', async done => {
    const event = { pathParameters: { id: _id }, body: { ...Customer } }
    const error = mongodb.MongoError

    mockingoose(Customer).toReturn(error, 'findOneAndUpdate')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 500)
    done()
  })
})
