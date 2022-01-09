const MongoHelper = require('../helpers/mongo-helper')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')
const { MissingParamError } = require('../../utils/errors')

let db

const makeSut = () => {
  return new LoadUserByEmailRepository()
}

describe('LoadUserByEmail Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(global.__MONGO_URI__)
    db = await MongoHelper.getDb()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should return null if no user is found', async () => {
    const sut = makeSut()
    const user = await sut.load('invalid_email@mail.com')
    expect(user).toBeNull()
  })

  test('should return an user if user is found', async () => {
    const sut = makeSut()
    const fakeUser = {
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    }
    const { insertedId } = await db.collection('users').insertOne(fakeUser)

    const user = await sut.load(fakeUser.email)
    expect(user).toEqual({
      _id: insertedId,
      password: fakeUser.password
    })
  })

  test('should throw if no email is provided', async () => {
    const sut = makeSut()
    await expect(async () => {
      await sut.load()
    }).rejects.toThrow(new MissingParamError('email'))
  })
})
