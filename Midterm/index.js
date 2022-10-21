const express = require("express")
const https = require('https')
const model = require("./model")
const app = express()
const port = 5000
app.use(express.json())
const { writeFile, readFile } = require('fs')
const util = require('util')
const writeFileAsync = util.promisify(writeFile)
const readFileAsync = util.promisify(readFile)
var pokemonJSON = []

app.listen(process.env.PORT || port, async()=>{
    try{
        pokemonJSON = await readFileAsync('./pokedex.json', 'utf-8')
    if (!pokemonJSON) {
      console.log("Could not read the file");
      return
    }
    pokemonJSON = JSON.parse(pokemonJSON)
    console.log(pokemonJSON);

    }catch(error){
        console.log(error)
        console.log('server error');
    }
    console.log(`Example app listening on port${port}`);
})

app.get('/api/v1/pokemons', (req, res) => {
    var count = req.query.count;
    var after = req.query.after;

    var newlist = [];

    for (i = after; i < +after+ +count; i++) {
     newlist.push(pokemonJSON[i])
    }

    res.json(newlist)


})     

app.post('/api/v1/pokemon', (req, res) => {
    pokemonJSON.push(req.body)
    res.send('Created a new pokemon')
  }
)    

// - create a new pokemon
app.get('/api/v1/pokemon/:id', (req, res) => {
    var found = false
    for (i = 0; i < pokemonJSON.length; i++) {
      if (pokemonJSON[i]._id == req.params.id) {
        found = true
        break
      }
    }
    if (found) { res.json(pokemonJSON[i]); return }
    res.json({ msg: "not found" })
  })                   
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

app.put('/api/v1/pokemon/:id',(req, res) => {
    var found = false
    for (i = 0; i < pokemonJSON.length; i++) {
      if (pokemonJSON[i]._id == req.params.id) {
        writeFileAsync('./pokedex.json', JSON.stringify(res.body), 'utf-8')
        found = true
        break
      }
    }
    if (found) { res.json(pokemonJSON[i]); return }
    res.json({ msg: "not found" })
})        
// - upsert a whole pokemon document




app.patch('/api/v1/pokemon/:id', (req,res) =>{
    pokemonJSON = pokemonJSON.map(({ _id, ...aPokemon }) => {

        if (_id == req.body._id) {
          console.log("Bingo!");
          return req.body
  
        } else
  
          return aPokemon
      })
  
      writeFileAsync('./pokedex.json', JSON.stringify(pokemonJSON), 'utf-8')
      .then(() => { })
      .catch((err) => { console.log(err); }
      )
  
      res.send("Updated successfully!")
})
// - patch a pokemon document or a portion of the pokemon document


app.delete('/api/v1/pokemon/:id', (req,res) => {
    pokemonJSON = pokemonJSON.filter((element) => element._id != req.params.id)
    res.send("Deleted successfully")
})                // - delete a  pokemon 


app.get('/api/v1/getPokemonswithRegex', (req,res) => {
    var {searchQuery} = req.query;

    const possibilities = pokemonJSON.filter(({ name }) => poke_regex.test(name.english))
    let poke_regex = /[searchQuery]/g 
    let filteredJson = possibilities.filter(({ poke_regex }) => poke_regex.test(name.english))

    res.send(filteredJson)
    
})