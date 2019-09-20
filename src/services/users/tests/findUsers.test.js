'use strict'

const mongoose = require('mongoose')
const mockingoose = require('mockingoose').default
const { createConnection } = require('../../../database/mongo/connection')
const { handler } = require('../endpoints/findUsers')
const User = require('../../../database/mongo/models/User')

jest.mock('../../../database/mongo/connection')

describe('Find and list users', () => {
  const _id = new mongoose.Types.ObjectId().toHexString()

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

  it('list total users:', async done => {
    const users = [user]
    const event = {}

    mockingoose(User).toReturn(users, 'find')

    const result = await handler(event, context)

    expect(result).toHaveProperty('statusCode', 200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body).users).toHaveLength(1)
    done()
  })

  it('finding users error', async done => {
    const event = { queryStringParameters: {} }

    mockingoose(User).toReturn(new Error('Timeout'), 'find')

    try {
      await handler(event, context)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }

    done()
  })
})
