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

app.listen(process.env.PORT || port, async()=>{
    try{
        await mongoose.connect("mongodb+srv://xr1chard:1234@cluster0.0zutyxg.mongodb.net/test",
        {useNewUrlParser: true, useUnifiedTopology: true});
        run();

    }catch(error){
        throw new PokemonDBError(err)
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



// - get all the pokemons after the 10th. List only Two.
app.get('/api/v1/pokemons',(req,res) => {
   var count = req.query.count;
   var after = req.query.after;

   if (after == NULL){
    throw new PokemonBadRequestMissingAfter("");
   }

   try{
    model.find({})
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
}) 
 

// - create a new pokemon
app.post('/api/v1/pokemon' ,(req,res) =>{
  model.create(req.body, function (err,result) {
    if (err){
      res.json({ errMsg: "ValidationError: check your ...",
                 error: err})
    }else{
      res.json({ msg: "Success (no duplcations allowed)" })
    }
    
  });
 })     
        
// get a pokemon
 app.get('/api/v1/pokemon/:id',(req,res)=> {

    if(req.params.id == NULL){
      throw new PokemonBadRequestMissingID("");
    }

    model.find({id:req.params.id })
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
 })  
 
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
app.put('/api/v1/pokemon/:id',(req,res) => {
    model.findOneAndUpdate({id:req.params.id },req.body,{upsert: true},(err, result)=>{
      if (err) {
        throw new PokemonNotFoundError("");
      }else{
        console.log(result)
        res.json({ msg: "Updated Successfully" })
      }
    })
})     
 

// - patch a pokemon document or a portion of the pokemon document
app.patch('/api/v1/pokemon/:id', (req,res) => {
  model.updateOne({id:req.params.id }, req.body, function (err, result) {
    if (err) {
      throw new PokemonNotFoundError("");
    }else{
      console.log(result);
      res.json({ msg: "Update Successful" })
    }
  
  });


})


app.delete('/api/v1/pokemon/:id', (req,res) => {

  model.deleteOne({id:req.params.id }, function (err, result) {
    if (err || result.deletedCount === 0) {
      throw new PokemonNotFoundError("");
    }else{
      res.json({ msg: "Deleted Successfully" ,
            "pokeInfo.id":req.params.id })
    }
   
  });

})           
  
app.get('*', function(req, res){
  throw new PokemonNoSuchRouteError("");
});