const jwt = require('jsonwebtoken')
const { MissingParamError } = require('../errors')

class TokenGenerator {
  constructor (secret) {
    this.secret = secret
  }

  async generate (id) {
    if (!this.secret) {
      throw new MissingParamError('secret')
    }
    return jwt.sign(id, this.secret)
  }
}

const makeSut = () => {
  return new TokenGenerator('secret')
}

describe('Token Generator', () => {
  test('should return null if JWT returns null', async () => {
    const sut = makeSut()
    jwt.token = null
    const token = await sut.generate('any_id')
    expect(token).toBeNull()
  })

  test('should return a token if JWT returns a token', async () => {
    const sut = makeSut()
    const token = await sut.generate('any_id')
    expect(token).toBe(jwt.token)
  })

  test('should call JWT with correct values', async () => {
    const sut = makeSut()
    await sut.generate('any_id')
    expect(jwt.id).toBe('any_id')
    expect(jwt.secret).toBe(sut.secret)
  })

  test('should throw if no secret is provided', async () => {
    const sut = new TokenGenerator()
    await expect(async () => {
      await sut.generate('any_id')
    }).rejects.toThrow(new MissingParamError('secret'))
  })

  test('should throw if no id is provided', async () => {
    const sut = new TokenGenerator()
    await expect(async () => {
      await sut.generate('any_id')
    }).rejects.toThrow(new MissingParamError('secret'))
  })
})
