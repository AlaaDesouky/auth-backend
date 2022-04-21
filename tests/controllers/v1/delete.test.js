import request from 'supertest'
import models from '../../../src/models'
import TestHelpers from '../../tests-helpers'

describe('delete', () => {
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
    newUserResponse = await TestHelpers.registerNewUser({ email: 'test@example.com', password: 'Test1234#' })
  })

  it('should delete user successfully', async () => {
    const accessToken = newUserResponse.body.data.accessToken
    const response = await request(app)
      .delete('/v1/delete')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
      .expect(200)
    expect(response.body.success).toEqual(true)
    expect(response.body.message).toEqual('Successfully deleted user')

    const { User } = models
    expect(await User.count()).toEqual(0)
  })

})