import TestHelpers from '../tests-helpers'
import models from '../../src/models'
import { it, expect } from '@jest/globals'

describe('User', () => {
  beforeAll(async () => {
    await TestHelpers.startDb()
  })

  afterAll(async () => {
    await TestHelpers.startDb()
  })

  describe('static methods', () => {
    describe('hashPassword', () => {
      it('should encrypt the password correctly', async () => {
        const { User } = models
        const password = 'Test1234#'
        const hashedPassword = await User.hashedPassword(password)
        expect(hashedPassword).toEqual(expect.any(String))
        expect(hashedPassword).not.toEqual(password)
      })
    })
  })
})