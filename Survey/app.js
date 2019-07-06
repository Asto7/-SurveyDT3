// server start: nodemon app.js
// mongodb start (form workspace folder): ../mongostart
const multer=require('multer');
const handle=require('handlebars');
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const passport = require('passport');
// load routes

const FM = require('./routes/FM');
const users = require('./routes/users').a;
// passport config
require('./config/passport')(passport);

// db config
const db = require('./config/database');

// connect to mongoose
mongoose.connect('mongodb://localhost:27017/FORM',
{useNewUrlParser: true}).then(() => {
    console.log('MongoDB connected...');
}).catch(err => {
    console.log(err);
});



// handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'

}));
app.set('view engine', 'handlebars');

handle.registerHelper('TRY',function(x){
  if(x==0)
  return('CHECKED');
});


// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage });



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// method override
app.use(methodOverride('_method'));

// express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true

}));

// adding passport middleware
// it is very important to add this after the express session
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());


// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg'); // needed for flash to work
  res.locals.error_msg = req.flash('error_msg');     // needed for flash to work
  res.locals.error = req.flash('error');             // needed for flash to work
  res.locals.user = req.user || null;                // needed for passport login/logout to work
  next();
})

app.get('/', (req, res) => {
    const title='Welcome to Asto Form!';
    res.render('index', {
       title: title
   });
});

app.get('/about', (req,res) => {
   res.render('about');
});


// use routes
app.use('/users', users);
app.use('/FM', FM);

const port = 4000;

app.listen(port, () => {
   console.log(`listening on port ${port}`);
});
