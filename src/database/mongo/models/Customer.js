const { Schema, model, connection } = require('mongoose')
const bcrypt = require('bcryptjs')

// schema de model
const CustomerSchema = new Schema(
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
    birthdate: {
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
      default: 'CUSTOMER',
      enum: ['CUSTOMER', 'USER', 'ADMIN']
    },
    avatar: {
      type: String,
      required: false
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

// faz com que nunca retorne o password nas operações
CustomerSchema.methods.toJSON = function () {
  const customerObject = this.toObject()
  delete customerObject.password

  return customerObject
}

// encriptação antes de salvar na database
CustomerSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// encriptação ao atualizar
CustomerSchema.pre('findOneAndUpdate', async function (next) {
  if (!this._update) next()

  if (this._update.password) {
    this._update.password = await bcrypt.hash(this._update.password, 10)
  }
  next()
})

// verificação se esta rodando offline para executar um delete do model
if (process.env.IS_OFFLINE) delete connection.models.Customer

// export do model
module.exports = model('Customer', CustomerSchema)
