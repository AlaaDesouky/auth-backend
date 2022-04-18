import '../src/config'
import Database from '../src/database'
import dbConfig from '../src/config/database'
import request from 'supertest'

let db;

class TestHelpers {
  static async startDb() {
    db = new Database('test', dbConfig)
    await db.connect()
    return db
  }

  static async stopDb() {
    await db.disconnect()
  }

  static async syncDb() {
    await db.sync()
  }

  static getApp() {
    // To make sure models are populated
    const App = require('../src/app').default
    return new App().getApp()
  }

  static async registerNewUser(options = {}) {
    const { email = 'test@example.com', password = 'Test1234#', endpoint = '/v1/register' } = options
    return request(TestHelpers.getApp()).post(endpoint).send({ email, password })
  }
}

export default TestHelpers