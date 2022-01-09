const MongoHelper = require('../helpers/mongo-helper')
const { MissingParamError } = require('../../utils/errors')
const UpdateAccessTokenRepository = require('./update-access-token-repository')

let db

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new UpdateAccessTokenRepository(userModel)

  return {
    userModel,
    sut
  }
}

describe('UpdateAccessToken Repository', () => {
  let fakeUserId

  beforeAll(async () => {
    await MongoHelper.connect(global.__MONGO_URI__)
    db = await MongoHelper.getDb()
  })

  beforeEach(async () => {
    const userModel = db.collection('users')
    await userModel.deleteMany()

    const fakeUser = {
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    }
    const { insertedId } = await userModel.insertOne(fakeUser)
    fakeUserId = insertedId
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should update the user with the given access token', async () => {
    const { sut, userModel } = makeSut()

    await sut.update(fakeUserId, 'valid_token')
    const updatedFakeUser = await userModel.findOne({ _id: fakeUserId })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })

  test('should throw if no UserModel is provided', async () => {
    const sut = new UpdateAccessTokenRepository()

    await expect(async () => {
      await sut.update(fakeUserId, 'valid_token')
    }).rejects.toThrow()
  })

  test('should throw if no params are provided', async () => {
    const { sut } = makeSut()

    await expect(async () => {
      await sut.update()
    }).rejects.toThrow(new MissingParamError('userId'))

    await expect(async () => {
      await sut.update(fakeUserId)
    }).rejects.toThrow(new MissingParamError('accessToken'))
  })
})
