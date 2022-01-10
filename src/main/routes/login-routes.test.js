const request = require('supertest')
const app = require('../config/app')
const bcrypt = require('bcrypt')
const MongoHelper = require('../../infra/helpers/mongo-helper')

let userModel

describe('Login Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(global.__MONGO_URI__)
    userModel = await MongoHelper.getCollection('users')
  })

  beforeEach(async () => {
    await userModel.deleteMany()
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should return 200 when valid credentials are provided', async () => {
    const fakeUser = {
      email: 'valid_email@mail.com',
      password: bcrypt.hashSync('valid_password', 10)
    }
    await userModel.insertOne(fakeUser)

    await request(app)
      .post('/api/login')
      .send({
        email: 'valid_email@mail.com',
        password: 'valid_password'
      })
      .expect(200)
  })

  test('should return 401 when invalid credentials are provided', async () => {
    await request(app)
      .post('/api/login')
      .send({
        email: 'invalid_email@mail.com',
        password: 'invalid_password'
      })
      .expect(401)
  })
})
