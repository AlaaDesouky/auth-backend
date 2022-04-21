import request from 'supertest'
import models from '../../../src/models'
import TestHelpers from '../../tests-helpers'

describe('update', () => {
  let app;
  let newUserResponse;

  beforeAll(async () => {
    await TestHelpers.startDb()
    app = TestHelpers.getApp()
  })

  afterAll(async () => {
    await TestHelpers.stopDb()
  })

  beforeEach(async () => {
    await TestHelpers.syncDb()
    newUserResponse = await TestHelpers.registerNewUser()
  })

  it('should not update user if not logged in', async () => {
    const response = await request(app)
      .put('/v1/update')
      .set('Authorization', `Bearer Invalid.token`)
      .send({
        firstName: 'testFirstName',
        lastName: 'testLastName',
        roles: ['admin']
      })
      .expect(401)
    expect(response.body.success).toEqual(false)
    expect(response.body.message).toEqual('Invalid token')
  })

  it('should update user data successfully', async () => {
    const accessToken = newUserResponse.body.data.accessToken
    const { User } = models
    const user = await User.scope('withPassword').findOne({ where: { email: "test@example.com" } })
    const response = await request(app)
      .put('/v1/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'testFirstName',
        lastName: 'testLastName',
        username: 'testUsername',
        password: 'Test12345'
      })
      .expect(200)
    expect(response.body.success).toEqual(true)
    expect(response.body.message).toEqual('Successfully updated user')

    const updatedUser = await User.scope('withPassword').findOne({ where: { email: 'test@example.com' } })
    expect(updatedUser.firstName).not.toEqual(user.firstName)
    expect(updatedUser.lastName).not.toEqual(user.lastName)
    expect(updatedUser.username).not.toEqual(user.username)
    expect(updatedUser.password).not.toEqual(user.password)
  })

  it('should update user roles successfully', async () => {
    const accessToken = newUserResponse.body.data.accessToken
    const { User, Role } = models
    const user = await User.findOne({ where: { email: "test@example.com" } })
    await request(app)
      .put('/v1/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        roles: ["admin"]
      })
      .expect(200)
    const newRole = await Role.findOne({ where: { role: 'admin' } })
    const userRolesCount = await user.countRoles()
    const hasRole = await user.hasRole(newRole)
    expect(userRolesCount).not.toEqual(0)
    expect(hasRole).toEqual(true)
  })

  it('should only update user roles if it does not exist', async () => {
    const accessToken = newUserResponse.body.data.accessToken
    const { User } = models
    const user = await User.findOne({ where: { email: "test@example.com" } })
    await request(app)
      .put('/v1/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        roles: ["admin"]
      })
      .expect(200)

    await request(app)
      .put('/v1/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        roles: ["admin", "testRole1", "testRole2"]
      })
      .expect(200)

    const userRolesCount = await user.countRoles()
    expect(userRolesCount).toEqual(3)
  })
})