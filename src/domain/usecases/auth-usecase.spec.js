const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeEncrypterSpy = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }

  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true

  return encrypterSpy
}

const makeEncrypterSpyWithError = () => {
  class EncrypterSpy {
    async compare () {
      throw new Error()
    }
  }
  return new EncrypterSpy()
}

const makeTokenGeneratorSpy = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }

  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'
  return tokenGeneratorSpy
}

const makeTokenGeneratorSpyWithError = () => {
  class TokenGeneratorSpy {
    async generate () {
      throw new Error()
    }
  }

  return new TokenGeneratorSpy()
}

const makeLoadUserByEmailRepositorySpy = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }

  return loadUserByEmailRepositorySpy
}

const makeLoadUserByEmailRepositorySpyWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load () {
      throw new Error()
    }
  }

  return new LoadUserByEmailRepositorySpy()
}

const makeSut = () => {
  const encrypterSpy = makeEncrypterSpy()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepositorySpy()
  const tokenGeneratorSpy = makeTokenGeneratorSpy()

  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy
  })

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy
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

  test('should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = null
    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password')
    expect(accessToken).toBeNull()
  })

  test('should return null if an invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false
    const accessToken = await sut.auth('valid_email@mail.com', 'invalid_password')
    expect(accessToken).toBeNull()
  })

  test('should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()
    await sut.auth('valid_email@mail.com', 'any_password')
    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.password)
  })

  test('should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@mail.com', 'valid_password')
    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  test('should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()
    const accessToken = await sut.auth('valid_email@mail.com', 'valid_password')
    expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })

  test('should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadUserByEmailRepository = makeLoadUserByEmailRepositorySpy()
    const encrypter = makeEncrypterSpy()

    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({
        loadUserByEmailRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: invalid
      })
    )

    for (let i = 0; i < suts.length; i++) {
      await expect(async () => {
        await suts[i].auth('any_email@mail.com', 'any_password')
      }).rejects.toThrow()
    }
  })

  test('should throw if any dependencie throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepositorySpy()
    const encrypter = makeEncrypterSpy()

    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositorySpyWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: makeEncrypterSpyWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: makeTokenGeneratorSpyWithError()
      })
    )

    for (let i = 0; i < suts.length; i++) {
      await expect(async () => {
        await suts[i].auth('any_email@mail.com', 'any_password')
      }).rejects.toThrow()
    }
  })
})
