const request = require('supertest')
const app = require('./app')

describe('App Setup', () => {
  test('shoud disable x-powered-by header', async () => {
    app.get('/text_x_powered_by', (req, res) => {
      res.send('')
    })
    // app.disable('x-powered-by')
    const res = await request(app).get('/text_x_powered_by')
    expect(res.headers['x-powered-by']).toBeUndefined()
  })
})
