import { Sequelize } from 'sequelize'
import { registerModels } from '../models'

class Database {
  constructor(environment, dbConfig) {
    this.environment = environment
    this.dbConfig = dbConfig
    this.isTestEnvironment = this.environment === 'test'
  }

  getConnectionString() {
    const { username, password, host, port, database } = this.dbConfig[this.environment]
    return `postgres://${username}:${password}@${host}:${port}/${database}`
  }

  async connect() {
    // Connection string
    const uri = this.getConnectionString()
    // Create the connection
    this.connection = new Sequelize(uri, { logging: this.isTestEnvironment ? false : console.log })
    // Check connection
    await this.connection.authenticate({ logging: false })

    if (!this.isTestEnvironment) {
      console.log('Connection has been established successfully')
    }

    // Register the models
    registerModels(this.connection)

    // Sync the models
    await this.sync()
  }

  async sync() {
    await this.connection.sync({
      force: this.isTestEnvironment,
      logging: false
    })
    if (!this.isTestEnvironment) {
      console.log('Models synchronized successfully')
    }
  }

  async disconnect() {
    await this.connection.close()
  }
}

export default Database