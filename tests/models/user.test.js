import TestHelpers from '../tests-helpers'
import models from '../../src/models'
import { it, expect, beforeEach } from '@jest/globals'

describe('User', () => {
  let newUserResponse;
  beforeAll(async () => {
    await TestHelpers.startDb()
  })

  afterAll(async () => {
    await TestHelpers.startDb()
  })

  beforeEach(async () => {
    await TestHelpers.syncDb()
    newUserResponse = await TestHelpers.registerNewUser({ email: 'test@example.com', password: 'Test1234#' })
  })

  describe('static methods', () => {
    // Hash password
    describe('hashPassword', () => {
      it('should encrypt the password correctly', async () => {
        const { User } = models
        const password = 'Test1234#'
        const hashedPassword = await User.hashPassword(password)
        expect(hashedPassword).toEqual(expect.any(String))
        expect(hashedPassword).not.toEqual(password)
      })
    })


    describe('instance methods', () => {
      // Compare password
      describe('comparePasswords', () => {
        it('should return true if the hashed password is the same as the original password', async () => {
          const { User } = models
          const user = await User.scope('withPassword').findOne({ where: { email: 'test@example.com' } })
          const arePasswordsEqual = await user.comparePassword("Test1234#")
          expect(arePasswordsEqual).toBe(true)
        })

        it('should return false if the hashed password is not the same as the original password', async () => {
          const { User } = models
          const user = await User.scope('withPassword').findOne({ where: { email: 'test@example.com' } })
          const arePasswordsEqual = await user.comparePassword('Test12342')
          expect(arePasswordsEqual).toBe(false)
        })
      })
    })

    // Create user with hashed password
    describe('hooks', () => {
      beforeEach(async () => {
        await TestHelpers.syncDb()
      })

      it('should create a user with a hashed password', async () => {
        const { User } = models
        const email = 'test@example.com'
        const password = 'Test1234#'
        await User.create({ email, password })
        const users = await User.findAll()
        expect(users.length).toBe(1)
        expect(users[0].email).toEqual(email)
        expect(users[0].password).not.toEqual(password)
      })
    })
  })
})