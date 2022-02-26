//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


//console.log(process.env.ENCRYPTION);

userSchema.plugin(encrypt, {secret: process.env.ENCRYPTION, encryptedFields:['password']});


const secretSchema =  {
  secret: String
};

const User = mongoose.model("User", userSchema);
const Secret = mongoose.model("secret", secretSchema);

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.get('/logout', function(req, res){
  res.redirect('/');
});

app.get('/submit', function(req, res){
  res.render('submit');
})

app.get('/secrets', function(req, res){
  let secretItems = [];
  Secret.find({}, function(err, foundSecrets){
    if(!err){
      foundSecrets.forEach(function (e){
      secretItems.push(e.secret);
      });
    } else {
      res.send(err);
    }
    //console.log(secretItems);
    res.render('secrets', {secret: secretItems});
  });
});

app.post('/register', function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('secrets');
    }
  });
});

app.post('/login', function(req, res){
  User.findOne({email: req.body.username, password: req.body.password},
  function(err, foundUser){
    if(!err){
      if(foundUser){
        res.redirect('secrets');
      } else {
        res.redirect('register');
      }
    } else {
      res.send(err);
    };
  });
});

app.post('/submit', function(req, res){
  const newSecret = new Secret ({
    secret: req.body.secret
  });
  newSecret.save(function(err){
    if(err){
      res.send(err)
    } else {
      res.redirect('secrets');
    };
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
})
