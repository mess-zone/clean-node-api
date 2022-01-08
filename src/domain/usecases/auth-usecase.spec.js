const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)

  return {
    sut,
    loadUserByEmailRepositorySpy
  }
}

describe('AuthUseCase', () => {
  test('should throw MissingParamError if no email is provided', async () => {
    const { sut } = makeSut()
    await expect(async () => {
      await sut.auth()
    }).rejects.toThrow(new MissingParamError('email'))
  })

  test('should throw MissingParamError if no password is provided', async () => {
    const { sut } = makeSut()
    await expect(async () => {
      await sut.auth('any_email@mail.com')
    }).rejects.toThrow(new MissingParamError('password'))
  })

  test('should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@mail.com', 'any_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@mail.com')
  })

  test('should throw if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase()
    await expect(async () => {
      await sut.auth('any_email@mail.com', 'any_password')
    }).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'))
  })

  test('should throw if LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({})
    await expect(async () => {
      await sut.auth('any_email@mail.com', 'any_password')
    }).rejects.toThrow(new InvalidParamError('loadUserByEmailRepository'))
  })

  test('should return null if LoadUserByEmailRepository returns null', async () => {
    const { sut } = makeSut()
    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password')
    expect(accessToken).toBeNull()
  })
})