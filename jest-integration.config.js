const config = require('./jest.config')
// arquivos de teste unitario tem a extensão .spec.js
// arquivos de teste de integração tem a extensão .test.js
config.testMatch = ['**/*.test.js']
module.exports = config
