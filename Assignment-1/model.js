const mongoose = require("mongoose")

const possibleTypes = ["Fire", "Normal","Water", 
"Grass", "Poison", "Flying", 
"Bug" , "Electric", "Rock",
"Fighting", "Psychic", "Ground",
"Ghost", "Ice", "Dragon" ,"Dark"
,"Fairy", "Steel" ]

const pokemonSchema = new mongoose.Schema({
    id: {type:Number, 
        unique:true} ,
    "name": {
        english:{
        type:String,
        required:true,
        max:20,
        validate:{
            validator: (v) => v.length < 21,
            message:"English name should be less than 20 characters"
        }
        },
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
    type:[{type:String,
            enum:possibleTypes}],
    
  });

module.exports = mongoose.model("Pokemon", pokemonSchema);

