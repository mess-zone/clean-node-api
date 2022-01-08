class AuthUseCase {
  async auth (email) {
    if (!email) {
      return new Error()
    }
  }
}

describe('AuthUseCase', () => {
  test('shuld throw if no email is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth()
    expect(promise).rejects.toThrow()
  })
})
