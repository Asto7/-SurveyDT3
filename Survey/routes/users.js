const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
var GOD;

// load user model
require('../models/User');
const User = mongoose.model('users');

//dynamic UserName
router.get('/kira',(req,res)=>{
  if(req.query.a.length<4)
  res.send('*Too short');
  else if(req.query.a.length==0)
  res.send('min');

else {  User.findOne({username:req.query.a}).then(result=>{
if(result)
{
  res.send('*Already Exists');

}
else res.send('*Availble');
  })
}
})

// user login route
router.get('/login', (req,res) => {
  res.render('users/login');
});

// user login route
router.get('/register', (req,res) => {
  res.render('users/register');
});


// login form post
router.post('/login', (req,res,next) => {

  passport.authenticate('local', {
    successRedirect: '/FM',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req,res,next);
});

router.get('/all', (req,res) => {
  User.find({}).then((result)=>{
    res.render('users/all',{USER:result});
   });

});


// register form post
router.post('/register', (req,res) => {
  let errors = [];
  console.log(req.body);
  if (req.body.password != req.body.password2) {
    errors.push({text: 'Passwords do not match!'});
  }
  if (req.body.password.length < 4) {
    errors.push({text: 'Password must be at least 4 characters'});
  }
  if (req.body.username.length < 4) {
    errors.push({text: 'Username must be at least 4 characters'});
  }
  if (req.body.ki=='red') {
    errors.push({text: 'Try Another Username which are Availble.'});
  }
  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      username:req.body.username,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    })
  } else {
    User.findOne({
      email: req.body.email
    }).then((user) => {
      if (user) {
        req.flash('error_msg', 'A user with the same email already exists');
        res.redirect('/users/register');
      } else {
        const newUser = new User({
          name: req.body.name,
          username:req.body.username,
          email: req.body.email,
          password: req.body.password,
          // acc:req.body.acc
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save().then((user) => {
              req.flash('success_msg', 'You are now registered and can login');
              res.redirect('/users/login');
            }).catch(err => {
              console.log(err);
              return;
            });
          });
        });
      }
    });
  }
})

router.get('/logout', (req,res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = {
  a:router,
b:GOD
}
