const express = require("express")
const mongoose = require("mongoose")
const https = require('https')
const model = require("./model")
const { asyncWrapper } = require("./asyncWrapper.js")
const userModel = require("./userModel.js")
const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError
} = require("./errors.js")
require("dotenv").config();


const app = express()
app.use(express.json())
app.listen(process.env.authServerPORT || port, async()=>{
  try{
      await mongoose.connect(process.env.DB_STRING,
      {useNewUrlParser: true, useUnifiedTopology: true});
      run();

  }catch(error){
      throw new PokemonDbError("")
  }
  console.log(`Example app listening on port${process.env.authServerPORT}`);
})

async function run(){

mongoose.connection.collections['pokemons'].drop( function(err) {
  console.log('collection dropped');
});

https.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json' , (res) => {
  let data = '';
  var pokemonArray = [];

  res.on('data', (chunk) =>{
      data += chunk;
  });
  
  res.on('end', (chunk) =>{
      pokemonArray = JSON.parse(data);
      model.insertMany(pokemonArray);
      
  });
}).on('error', (error) => {
  console.log(error);
})



https.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json' , (res) => {
  let data = '';
  var types = [];

  res.on('data', (chunk) =>{
      data += chunk;
  });
  
  res.on('end', (chunk) =>{
      types = JSON.parse(data);
      
  });
}).on('error', (error) => {
  console.log(error);
})

}


//----------------------------------------// 

const bcrypt = require("bcrypt")
app.post('/register', asyncWrapper(async (req, res) => {
  const { username, password, email } = req.body
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  const userWithHashedPassword = { ...req.body, password: hashedPassword }

  const user = await userModel.create(userWithHashedPassword)
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

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
  res.header('auth-token', token)
  res.send(user)
}))


app.post('/logout', asyncWrapper(async(req,res) =>{
   res.status(202).clearCookie('auth-token').send('cookie cleared')
}))





