const { Schema, model, connection } = require('mongoose')
const bcrypt = require('bcryptjs')

// schema de model
const PsychologistSchema = new Schema(
  {
    name: {
      type: String,
      minlength: 3,
      required: [true, 'E necessario um nome para continuar']
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'E necessario um email']
    },
    phone: {
      type: String,
      required: false
    },
    cpf: {
      type: String,
      unique: true,
      maxlength: 11,
      minlength: 11,
      required: [true, 'E necessario o cpf']
    },
    bithdate: {
      type: String,
      required: [true, 'E necessaria a data de nascimento']
    },
    password: {
      type: String,
      required: [true, 'E necessaria a escolha de uma senha'],
      minlength: 8
    },
    crp: {
      type: String,
      unique: true,
      required: [true, 'E nececssario o numero do crp']
    },
    description: {
      type: String,
      maxlength: 300,
      required: false
    },
    avatar: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
)

// faz com que nunca retorne o password nas operações
PsychologistSchema.methods.toJSON = function () {
  const psychologistObject = this.toObject()
  delete psychologistObject.password

  return psychologistObject
}

// encriptação antes de salvar na database
PsychologistSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// encriptação ao atualizar
PsychologistSchema.pre('findOneAndUpdate', async function (next) {
  if (!this._update) next()

  if (this._update.password) {
    this._update.password = await bcrypt.hash(this._update.password, 10)
  }
  next()
})

// verificação se esta rodando offline para executar um delete do model
if (process.env.IS_OFFLINE) delete connection.models.Psychologist

// export do model
module.exports = model('Psychologist', PsychologistSchema)
