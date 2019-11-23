// requires do test
const mongoose = require('mongoose')
const mockingoose = require('mockingoose').default
const { createConnection } = require('../../../database/mongo/connection')
const { handler } = require('../endpoints/updateUser')
const User = require('../../../database/mongo/models/User')
const { ObjectId } = require('mongodb')
const mongodb = require('mongodb')
const createError = require('http-errors')

// mock opcional pois require do mockingoose ja mock a conexão
jest.mock('../../../database/mongo/connection')

describe('Test update user:', () => {
  const _id = new mongoose.Types.ObjectId()
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
    createConnection.mockImplementation(() => Promise.resolve(true))
  })

  it('update as successfully:', async done => {
    const event = { pathParameters: { id: _id }, body: { ...user } }

    mockingoose(User).toReturn(user, 'findOneAndUpdate')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('user')
    done()
  })

  it('received id malformed:', async done => {
    let id = 'abc'
    const event = { pathParameters: { id }, body: { ...user } }

    if (ObjectId.isValid(id)) {
      mockingoose(User).toReturn({ id: 1 }, 'findOneAndUpdate')
    } else {
      mockingoose(User).toReturn(createError(422), 'findOneAndUpdate')
    }

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 422)
    done()
  })

  it('user is not found:', async done => {
    const id = 1
    const event = { pathParameters: { id }, body: { ...user } }

    mockingoose(User).toReturn(null, 'findOneAndUpdate')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 404)
    done()
  })

  it('timeout error:', async done => {
    const event = { pathParameters: { id: _id } }

    mockingoose(User).toReturn(new Error('Timeout'), 'findOneAndUpdate')

    try {
      await handler(event, context)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }

    done()
  })

  it('internal server error:', async done => {
    const event = { pathParameters: { id: _id }, body: { ...user } }
    const error = mongodb.MongoError

    mockingoose(User).toReturn(error, 'findOneAndUpdate')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 500)
    done()
  })
})