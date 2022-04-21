import { Model, DataTypes } from 'sequelize'
import bcrypt from 'bcrypt'
import environment from '../config/environment'
import JWTUtils from '../utils/jwt-utils'
import { user } from 'pg/lib/defaults'

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.Roles = User.hasMany(models['Role'])
      User.RefreshToken = User.hasOne(models['RefreshToken'])
    }

    // Password Handling
    static async hashPassword(password) {
      return bcrypt.hash(password, environment.saltRounds)
    }

    static async createNewUser({ email, password, roles }) {
      return sequelize.transaction(async () => {
        const jwtPayload = { email }
        const accessToken = JWTUtils.generateAccessToken(jwtPayload)
        const refreshToken = JWTUtils.generateRefreshToken(jwtPayload)

        let rolesToSave = []
        if (roles && Array.isArray(roles)) {
          rolesToSave = roles.map((role) => ({ role }))
        }

        const hashedPassword = await User.hashPassword(password)
        await User.create({ email, password: hashedPassword, Roles: rolesToSave, RefreshToken: { token: refreshToken } },
          { include: [User.Roles, User.RefreshToken] })

        return { accessToken, refreshToken }
      })
    }
  }

  // User fields
  User.init({
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Not a valid email address"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      validate: {
        len: {
          args: [0, 50],
          msg: 'First name has too many characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      validate: {
        len: {
          args: [0, 50],
          msg: 'Last name has too many characters'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    indexes: [{ unique: true, fields: ['email'] }],
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  })

  User.prototype.updateUser = async function (data = {}) {
    return sequelize.transaction(async () => {
      const { roles, password } = data.userAuthorizationData

      if (roles) {
        await this.setUserRoles(roles)
      }

      if (password) {
        const hashedPassword = await User.hashPassword(password)
        await this.update({ password: hashedPassword })
      }

      await this.update({ ...data.userInformationData })
    })
  }

  // Update user Roles
  User.prototype.setUserRoles = async function (roles = []) {
    let savedRoles = {}
    let userSavedRoles = await this.getRoles()

    userSavedRoles.map((role) => {
      !savedRoles[role.role] && (savedRoles[role.role] = true)
    })

    for (const role of roles) {
      !savedRoles[role] && await this.createRole({ role })
    }

    return this.getRoles()
  }

  User.prototype.deleteUser = async function () {
    return sequelize.transaction(async () => {
      await this.destroy()
    })
  }

  // Compare password
  User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
  }

  // Return
  return User
}