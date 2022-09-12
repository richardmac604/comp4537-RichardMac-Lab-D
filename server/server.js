const express = require('express')
const app = express()
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({
  extended: true
}));
//mongoose
const mongoose = require('mongoose');

// **I used atlas for this lab for my mongodb database **
mongoose.connect("mongodb+srv://xr1chard:1234@cluster0.0zutyxg.mongodb.net/cities",
 {useNewUrlParser: true, useUnifiedTopology: true});
const citySchema = new mongoose.Schema({
    name: String,
    temperature: Number,
    description: String
});


app.use(bodyparser.json());

app.get('/cities', (req, res) => {
  const cities = [];
  // code to retrieve all cities...
  res.json(cities);
});

app.post('/cities', (req, res) => {
  // code to add a new city...
  res.json(req.body);
});

app.put('/cities/:name', (req, res) => {
  const { name } = req.params;
  // code to update a city...
  res.json(req.body);
});

app.delete('/cities/:name', (req, res) => {
  const { name } = req.params;
  // code to delete a city...
  res.json({ deleted: id });
});
const cityModel = mongoose.model("cities", citySchema);

const apikey = "b660f3402c54cb9a9c48f89c35249e5c";

// app.get('/', function (req, res) {
//     res.send('GET request to homepage')
//   })

app.get('/contact', function (req, res) {
  res.send('Hi there, here is my <a href="mailto:nabil@eceubc.ca"> email </a>.')
})

app.use(express.static('./public'));


const https = require('https');

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/index.html");
})

app.post("/", function(req, res) {
  // res.send("post req received" + req.body.cityName);
  var apikey = "b660f3402c54cb9a9c48f89c35249e5c";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + req.body.cityName + "&units=metric&appid=" + apikey

  https.get(url, function(https_res) {
    https_res.on("data", function(data) {
      res.write("<h1> " + req.body.cityName + " weather is " + JSON.parse(data).weather[0].description) + "</h1>";
      res.write("<h1> " + req.body.cityName + " temp is " + JSON.parse(data).main.temp) + "</h1>";

      // console.log(JSON.parse(data).weather[0].icon );
      res.write('  <img src="' + "http://openweathermap.org/img/wn/" + JSON.parse(data).weather[0].icon + '.png"' + "/>");
      res.send();
    })
  });

})


app.get('/cities/:city_name', function(req, res) {
    console.log("received a request for "+ req.params.city_name);
    cityModel.find({name: req.params.city_name}, function(err, cities){
        if (err){
          console.log("Error " + err);
        }else{
          console.log("Data "+ JSON.stringify(cities));
        }
        res.send(JSON.stringify(cities));
    });
  })
  app.get('/cities', function(req, res) {
    cityModel.find({}, function(err, cities){
        if (err){
          console.log("Error " + err);
        }else{
          console.log("Data "+ JSON.stringify(cities));
        }
        res.send(JSON.stringify(cities));
    });
  })



app.listen(5000, function(err){
    if(err) console.log(err);
    })