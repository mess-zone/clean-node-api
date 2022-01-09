const request = require('supertest')
const app = require('../config/app')

describe('JSON Parser Middleware', () => {
  test('shoud parser body as json', async () => {
    app.post('/test_json-parser', (req, res) => {
      res.send(req.body)
    })

    await request(app)
      .post('/test_json-parser')
      .send({ any: 'any' })
      .expect({ any: 'any' })
  })
})
