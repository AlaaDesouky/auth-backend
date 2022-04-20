import request from 'supertest'
import models from '../../../src/models'
import TestHelpers from '../../tests-helpers'

describe('register', () => {
  let app;

  beforeAll(async () => {
    await TestHelpers.startDb()
    app = TestHelpers.getApp()
  })

  afterAll(async () => {
    await TestHelpers.stopDb()
  })

  beforeEach(async () => {
    await TestHelpers.syncDb()
  })

  it('should register a new user successfully', async () => {
    await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test1234#' }).expect(201)
    const { User } = models
    const users = await User.findAll()
    expect(users.length).toEqual(1)
    expect(users[0].email).toEqual('test@example.com')
  })

  it('should register a new user successfully with roles', async () => {
    await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test1234#', roles: ['admin', 'customer'] }).expect(201)
    const { User, Role } = models
    const users = await User.findAll({ include: Role })
    expect(users.length).toEqual(1)
    expect(users[0].email).toEqual('test@example.com')
    const roles = users[0]['Roles']
    expect(roles.length).toEqual(2)
    expect(roles[0].role).toEqual('admin')
    expect(roles[1].role).toEqual('customer')
  })

  it('should not create a new user if it already exists', async () => {
    await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test1234#' }).expect(201)
    const response = await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test1234#' }).expect(200)
    expect(response.body).toEqual({
      success: false,
      message: 'User already exists'
    })
  })
})