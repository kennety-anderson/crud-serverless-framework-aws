'use strict'

const mongoose = require('mongoose')
const mockingoose = require('mockingoose').default
const { createConnection } = require('../../../database/mongo/connection')
const { handler } = require('../endpoints/findOneUser')
const User = require('../../../database/mongo/models/User')
const { ObjectId } = require('mongodb')
const createError = require('http-errors')

jest.mock('../../../database/mongo/connection')

describe('Test find one user', () => {
  const _id = new mongoose.Types.ObjectId()

  const user = {
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

  it('find user successfully:', async done => {
    const event = { pathParameters: { id: _id } }

    mockingoose(User).toReturn(_id, 'findOne')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('user')
    done()
  })

  it('user is not found:', async done => {
    const event = { pathParameters: { id: 1 } }

    mockingoose(User).toReturn(null, 'findOne')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 404)
    done()
  })

  it('received id malformed:', async done => {
    let id = 'abc'

    const event = { pathParameters: { id } }

    if (ObjectId.isValid(id)) {
      mockingoose(User).toReturn({ id: 1 }, 'findOne')
    } else {
      mockingoose(User).toReturn(createError(422), 'findOne')
    }

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 422)
    done()
  })

  it('finding user error', async done => {
    const event = { pathParameters: { id: _id } }

    mockingoose(User).toReturn(new Error('Timeout'), 'findOne')

    try {
      await handler(event, context)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }

    done()
  })
})
