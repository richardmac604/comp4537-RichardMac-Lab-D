const express = require("express")
const mongoose = require("mongoose")

const app = express()
const port = 5000

app.listen(process.env.PORT || port, async()=>{
    try{
        await mongoose.connect("mongodb+srv://xr1chard:1234@cluster0.0zutyxg.mongodb.net/test")
    }catch(error){
        console.log('db error');
    
    }
    console.log('Example app listening on port${Port}');
})

const { Schema } = mongoose;

const unicornSchema = new Schema({
  "name": String, // String is shorthand for {type: String}
  "weight": Number,
  "loves": [String],
  "gender": {
    enum: ["f", "m"]
  },
  "vampires": Number,
  "dob": Date
});

const unicornModel = mongoose.model('unicorns', unicornSchema); // unicorns is the name of the collection in db


app.get('/api/v2/unicorns', (req, res) => {
    unicornModel.find({})
      .then(docs => {
        console.log(docs)
        res.json(docs)
      })
      .catch(err => {
        console.error(err)
        res.json({ msg: "db reading .. err.  Check with server devs" })
      })
    // res.json(unicornsJSON)
  })



  app.get('/api/v2/unicorn/:id', (req, res) => {

    console.log(req.params.id);
    unicornModel.find({ _id: mongoose.Types.ObjectId(`${req.params.id}`) })
      .then(doc => {
        console.log(doc)
        res.json(doc)
      })
      .catch(err => {
        console.error(err)
        res.json({ msg: "db reading .. err.  Check with server devs" })
      })
  })

app.use(express.json())
app.post('/api/v2/unicorn', (req, res) => {

  unicornModel.create(req.body, function (err) {
    if (err) console.log(err);
  });
  res.json(req.body)
})  

app.patch('/api/v2/unicorn/:id', (req, res) => {

    const { _id, ...rest } = req.body;
    unicornModel.updateOne({ _id: mongoose.Types.ObjectId(req.params.id) }, rest, function (err, res) {

      if (err) console.log(err)
      console.log(res)
    });
  
    res.send("Updated successfully!")
  })

  app.delete('/api/v2/unicorn/:id', (req, res) => {

    unicornModel.deleteOne({ _id: mongoose.Types.ObjectId(req.params.id) }, function (err, result) {
      if (err) console.log(err);
      console.log(result);
    });
  
    res.send("Deleted successfully?")
  })


  app.patch('/api/v2/unicornNewLovesFood/:id/', (req, res) => {
    unicornModel.updateOne({ _id: mongoose.Types.ObjectId(req.params.id) }, req.body, function (err, res) {

      if (err) console.log(err)
      console.log(res)
    });
  
    res.send("Updated successfully!")
  })
  
  app.patch('/api/v2/unicornAddLovesFood/:id/', (req, res) => {
    unicornModel.updateOne({ _id: mongoose.Types.ObjectId(req.params.id) }, {
      $push: {
        loves: req.body.newLoves
      }
    }, function (err, res) {
  
      if (err) console.log(err)
      console.log(res)
    });
    res.send("Updated successfully!")
  })
  
  app.patch('/api/v2/unicornRemoveLovesFood/:id/:item', (req, res) => {
    unicornModel.updateOne({ _id: mongoose.Types.ObjectId(req.params.id) }, {
      $pull: {
        loves: req.params.item
      }
    }, function (err, res) {
 
      if (err) console.log(err)
      console.log(res)
    });
    res.send("Updated successfully!")
  })