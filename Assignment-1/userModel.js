const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    min: 3,
    max: 20
  },
  password: {
    type: String,
    required: true,
    trim: true,
    min: 6,
    max: 1000,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    min: 3
  },
  date: {
    type: Date,
    default: Date.now
  },
  jwt_token:{
    type:String,
    require:false,
    trim:true,
    default:null
  },
  admin:{
    type:Boolean,
    require:false,
    trim:true, 
    default:null
  }
  
})

module.exports = mongoose.model('pokeUser', schema) //pokeUser is the name of the collection in the db
