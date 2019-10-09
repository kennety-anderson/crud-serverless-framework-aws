const { Schema, model, connection } = require('mongoose')
const bcrypt = require('bcryptjs')

// schema de model
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'E necessario um nome de usuario']
    },
    email: {
      type: String,
      required: [true, 'E necessario um email unico de usuario'],
      unique: true
    },
    cpf: {
      type: String,
      required: [true, 'E necessario um cpf'],
      maxlength: 11,
      minlength: 11,
      unique: true
    },
    birthDate: {
      type: String,
      required: [true, 'E necessaria a data de nascimento']
    },
    password: {
      type: String,
      required: [true, 'E necessaria a escolha de uma senha'],
      minlength: 8
    },
    permission: {
      type: String,
      default: 'USER',
      enum: ['USER', 'ADMIN']
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

// encriptação antes de salvar na database
UserSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// encriptação ao atualizar
UserSchema.pre('findOneAndUpdate', async function (next) {
  console.log(this._update)

  const { password } = this._update

  if (password) this._update.password = await bcrypt.hash(password, 10)
  console.log(this._update.password)
  next()
})

// verificação se esta rodando offline para executar um delete do model
if (process.env.IS_OFFLINE) delete connection.models.User

// export do model
module.exports = model('User', UserSchema)
