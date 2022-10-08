const express = require("express")
const mongoose = require("mongoose")
const https = require('https')
const model = require("./model")
const app = express()
const port = 5000

app.listen(process.env.PORT || port, async()=>{
    try{
        await mongoose.connect("mongodb+srv://xr1chard:1234@cluster0.0zutyxg.mongodb.net/test",
        {useNewUrlParser: true, useUnifiedTopology: true});
        run();

    }catch(error){
        console.log('db error');
    }
    console.log(`Example app listening on port${port}`);
})


const possibleTypes = [["Fire", "Normal","Water", 
"Grass", "Poison", "Flying", 
"Bug" , "Electric", "Rock",
"Fighting", "Psychic", "Ground",
"Ghost", "Ice", "Dragon" ,"Dark"
,"Fairy", "Steel", ]]

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




// app.get('/api/v1/pokemons?count=2&after=10')     // - get all the pokemons after the 10th. List only Two.
 

// - create a new pokemon
app.post('/api/v1/pokemon' ,(req,res) =>{
  model.create(req.body, function (err) {
    if (err) console.log(err);
  });
  res.json(req.body)
 })      
        
// get a pokemon
 app.get('/api/v1/pokemon/:id',(req,res)=> {
  console.log(req.params.id);
    model.find({id:req.params.id })
      .then(doc => {
        console.log(doc)
        res.json(doc)
      })
      .catch(err => {
        console.error(err)
        res.json({ msg: "Unable to find pokemon by ID" })
      })
 })  
 
// get a pokemon Image URL
app.get('/api/v1/pokemonImage/:id', (req,res) => {
 
      const imageUrl = "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/00" + req.params.id + ".png"

      res.write("<img src=" + imageUrl + " ></img>")
      res.send();
  
  

})     
// app.put('/api/v1/pokemon/:id')                   // - upsert a whole pokemon document
// app.patch('/api/v1/pokemon/:id')                 // - patch a pokemon document or a
                                                    //   portion of the pokemon document
// app.delete('/api/v1/pokemon/:id')                // - delete a  pokemon 
  