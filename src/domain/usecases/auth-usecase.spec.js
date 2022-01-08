const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  async auth (email) {
    if (!email) {
      throw new MissingParamError('email')
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
})
