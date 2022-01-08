const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
  }
}

describe('AuthUseCase', () => {
  test('should throw MissingParamError if no email is provided', async () => {
    const sut = new AuthUseCase()
    await expect(async () => {
      await sut.auth()
    }).rejects.toThrow(new MissingParamError('email'))
  })

  test('should throw MissingParamError if no password is provided', async () => {
    const sut = new AuthUseCase()
    await expect(async () => {
      await sut.auth('any_email@mail.com')
    }).rejects.toThrow(new MissingParamError('password'))
  })
})
