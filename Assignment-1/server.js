const express = require("express")
const mongoose = require("mongoose")
const https = require('https')
const model = require("./model")
const app = express()
const port = 5000
app.use(express.json())
const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError
} = require("./errors.js")

const { asyncWrapper } = require("./asyncWrapper.js")
const userModel = require("./userModel.js")

app.listen(process.env.PORT || port, async()=>{
    try{
        await mongoose.connect("mongodb+srv://xr1chard:1234@cluster0.0zutyxg.mongodb.net/test",
        {useNewUrlParser: true, useUnifiedTopology: true});
        run();

    }catch(error){
        throw new PokemonDbError("")
    }
    console.log(`Example app listening on port${port}`);
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

//https get request for pokemon data

// const bcrypt = require("bcrypt")

// app.post('/register', asyncWrapper(async (req, res) => {
//   const { username, password, email } = req.body
//   const salt = await bcrypt.genSalt(10)
//   const hashedPassword = await bcrypt.hash(password, salt)
//   const userWithHashedPassword = { ...req.body, password: hashedPassword }

//   const user = await userModel.create(userWithHashedPassword)
//   res.send(user)
// }))

 const jwt = require("jsonwebtoken")

// app.post('/login', asyncWrapper(async (req, res) => {
//   const { username, password } = req.body
//   const user = await userModel.findOne({ username })
//   if (!user) {
//     throw new PokemonBadRequest("User not found")
//   }
//   const isPasswordCorrect = await bcrypt.compare(password, user.password)
//   if (!isPasswordCorrect) {
//     throw new PokemonBadRequest("Password is incorrect")
//   }

//   // Create and assign a token
//   const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
//   res.header('auth-token', token)

//   res.send(user)
// }))




app.get('/users',(req,res) => { 
  try{
    setTimeout(() => {
      throw new Error('BROKEN')
      res.send("hello world")
    }, 1000)
  }catch(error){
    res.send('error');
  }
 
})


const auth = (req, res, next) => {
  const token = req.header('auth-token')
  if (!token) {
    throw new PokemonBadRequest("Access denied")
  }
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET) // nothing happens if token is valid
    next()
  } catch (err) {
    throw new PokemonBadRequest("Invalid token")
  }
}


app.use(auth);
// - get all the pokemons after the 10th. List only Two.
app.get('/api/v1/pokemons',asyncWrapper(async(req,res) => {
   var count = req.query.count;
   var after = req.query.after;

   try{
    await model.find({})
    .skip(after)
    .limit(count)
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      res.json({msg:err});
    })
   }catch(err) {
    res.json({msg: "That didn't work. Check queries again"});
   }
})) 
 

// - create a new pokemon
app.post('/api/v1/pokemon' ,asyncWrapper(async(req,res) =>{
  await model.create(req.body, function (err,result) {
    if (err){
      res.json({ errMsg: "ValidationError: check your ...",
                 error: err})
    }else{
      res.json({ msg: "Success (no duplcations allowed)" })
    }
    
  });
 }))     
        
// get a pokemon
 app.get('/api/v1/pokemon/:id',asyncWrapper(async(req,res)=> {

    if(!req.params.id){
      throw new PokemonBadRequestMissingID("");
    }

    await model.find({id:req.params.id })
      .then(doc => {
        if (doc.length === 0){
          res.json({ errMsg: "Pokemon not found" })
        }else{
          throw new PokemonNotFoundError("");
        }
       
      })
      .catch(err => {
        console.error(err)
        res.json({ errMsg: "Cast Error: pass pokemon id between 1 and 811" })
      })
 }))  
 
// get a pokemon Image URL
app.get('/api/v1/pokemonImage/:id', (req,res) => {
      
      var pokeNum = "00";
      if(req.params.id > 9){
         pokeNum = "0"
      }
      if(req.params.id > 99){
        pokeNum = ""
     }
      
      const imgUrl = "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/"+ pokeNum + req.params.id + ".png"
      res.json({ url: imgUrl })

  

})     

//- upsert a whole pokemon document
app.put('/api/v1/pokemon/:id', asyncWrapper(async(req,res) => {
    await model.findOneAndUpdate({id:req.params.id },req.body,{upsert: true},(err, result)=>{
      if (err) {
        throw new PokemonNotFoundError("");
      }else{
        console.log(result)
        res.json({ msg: "Updated Successfully" })
      }
    })
}))     
 

// - patch a pokemon document or a portion of the pokemon document
app.patch('/api/v1/pokemon/:id', asyncWrapper(async(req,res) => {
  await model.updateOne({id:req.params.id }, req.body, function (err, result) {
    if (err) {
      throw new PokemonNotFoundError("");
    }else{
      console.log(result);
      res.json({ msg: "Update Successful" })
    }
  
  });


}))


app.delete('/api/v1/pokemon/:id', asyncWrapper(async(req,res) => {

  await model.deleteOne({id:req.params.id }, function (err, result) {
    if (err || result.deletedCount === 0) {
      throw new PokemonNotFoundError("");
    }else{
      res.json({ msg: "Deleted Successfully" ,
            "pokeInfo.id":req.params.id })
    }
   
  });

}))           
  
app.get('*', function(req, res){
  throw new PokemonNoSuchRouteError("");
});