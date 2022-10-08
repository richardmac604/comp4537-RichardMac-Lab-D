const mongoose = require("mongoose")


const pokemonSchema = new mongoose.Schema({
    "id": Number, 
    "name": {
        "english":String,
        "japanese":String,
        "chinese":String,
        "french":String,
    },
    "base": {
        HP:Number,
        Attack:Number,
        Defense:Number,
        Speed:Number,
        "Sp. Attack":Number,
        "Sp. Defense":Number,
    },
    "type":[String]
    
  });

module.exports = mongoose.model("Pokemon", pokemonSchema);

