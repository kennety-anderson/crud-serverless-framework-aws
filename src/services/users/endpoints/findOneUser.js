'use strict'

const httpJsonBodyParser = require('@middy/http-json-body-parser')
const middy = require('@middy/core')

const handler = middy(async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      input: event.body
    })
  }
})
handler.use(httpJsonBodyParser())

module.exports = { handler }

// queryStringParameters
