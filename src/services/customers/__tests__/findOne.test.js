const mongoose = require('mongoose')
const mockingoose = require('mockingoose').default
const { createConnection } = require('../../../database/mongo/connection')
const { handler } = require('../endpoints/findOne')
const Customer = require('../../../database/mongo/models/Customer')
const { ObjectId } = require('mongodb')
const createError = require('http-errors')

jest.mock('../../../database/mongo/connection')

describe('Test find one customer', () => {
  const _id = new mongoose.Types.ObjectId()

  const context = {}

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  beforeAll(() => {
    createConnection.mockImplementation(() => Promise.resolve(true))
  })

  it('find customer successfully:', async done => {
    const event = { pathParameters: { id: _id } }

    mockingoose(Customer).toReturn(_id, 'findOne')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('data')
    done()
  })

  it('customer is not found:', async done => {
    const event = { pathParameters: { id: 1 } }

    mockingoose(Customer).toReturn(null, 'findOne')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 404)
    done()
  })

  it('received id malformed:', async done => {
    let id = 'abc'
    const event = { pathParameters: { id } }

    if (ObjectId.isValid(id)) {
      mockingoose(Customer).toReturn({ id: 1 }, 'findOne')
    } else {
      mockingoose(Customer).toReturn(createError(422), 'findOne')
    }

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 422)
    done()
  })

  it('timeout error:', async done => {
    const event = { pathParameters: { id: _id } }

    mockingoose(Customer).toReturn(new Error('Timeout'), 'findOne')

    try {
      await handler(event, context)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }

    done()
  })
})
