const express = require("express")
const mongoose = require("mongoose")
const { asyncWrapper } = require("./asyncWrapper.js")
const userModel = require("./userModel.js")
var cookieParser = require('cookie-parser')
const {
  PokemonBadRequest,
  PokemonDbError,
} = require("./errors.js")
require("dotenv").config();

const app = express()

app.use(express.json())
app.listen(process.env.authServerPORT, async()=>{
  try{
      await mongoose.connect(process.env.DB_STRING,
      {useNewUrlParser: true, useUnifiedTopology: true});
    

  }catch(error){
      throw new PokemonDbError("")
  }
  console.log(`Example app listening on port${process.env.authServerPORT}`);
})



//----------------------------------------// 

app.use(cookieParser())
const bcrypt = require("bcrypt")
app.post('/register', asyncWrapper(async (req, res) => {
  const { username, password, email, admin } = req.body
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  const userWithHashedPassword = { ...req.body, password: hashedPassword }

  const user = await userModel.create(userWithHashedPassword)

  const token = jwt.sign({ admin: user.admin }, process.env.TOKEN_SECRET)

  const filter = { username:username };
  const update = { jwt_token:token };
  const newUser = await userModel.findOneAndUpdate(filter, update);
  res.send(user)
}))

const jwt = require("jsonwebtoken")

app.post('/login', asyncWrapper(async (req, res) => {
  const { username, password } = req.body
  
  const user = await userModel.findOne({ username })
  if (!user) {
    throw new PokemonBadRequest("User not found")
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new PokemonBadRequest("Password is incorrect")
  }
  
  console.log(user["jwt_token"])
  res.cookie('auth-token', user["jwt_token"]);
  //res.header('auth-token', token)
  res.send(user)
  
}))


app.post('/logout', asyncWrapper(async(req,res) =>{
   res.status(202).clearCookie('auth-token').send('cookie cleared')
}))





