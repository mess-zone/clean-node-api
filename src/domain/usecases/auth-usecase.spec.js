const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  constructor (loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    await this.loadUserByEmailRepository.load(email)
  }
}

const makeSut = () => {

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

  test('should call LoadUserByEmailRepository with correct email', async () => {
    class LoadUserByEmailRepositorySpy {
      async load (email) {
        this.email = email
      }
    }
    const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
    const sut = new AuthUseCase(loadUserByEmailRepositorySpy)
    sut.auth('any_email@mail.com', 'any_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@mail.com')
  })
})
