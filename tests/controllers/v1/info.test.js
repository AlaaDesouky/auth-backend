import request from 'supertest'
import models from '../../../src/models'
import TestHelpers from '../../tests-helpers'

describe('info', () => {
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

  it('should get user information successfully', async () => {
    const accessToken = newUserResponse.body.data.accessToken
    const response = await request(app)
      .get('/v1/info')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
      .expect(200)
    expect(response.body.success).toEqual(true)
    expect(response.body.data.email).toEqual('test@example.com')
    expect(response.body.data.username).toEqual(null)
    expect(response.body.data.firstName).toEqual(null)
    expect(response.body.data.lastName).toEqual(null)
    expect(response.body.data.roles).toEqual([])
  })

})