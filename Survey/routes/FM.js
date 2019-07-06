const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');
const multer=require('multer');
const db = require('../config/database');
const fs=require('fs');
// load helper

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage });


// load schema
require('../models/fm');
const To = mongoose.model('FM');
require('../models/User');
const User = mongoose.model('users');




router.get('/createtemplate',ensureAuthenticated, (req,res) => {
  res.render('FM/preexist');
});

router.get('/templategallery',ensureAuthenticated, (req,res) => {
  res.render('FM/templateGallery');
});

router.get('/templategallery1',ensureAuthenticated, (req,res) => {
  res.render('FM/templateGallery1');
});

router.get('/templategallery2',ensureAuthenticated, (req,res) => {
  res.render('FM/templateGallery2');
});

router.get('/templategallery3',ensureAuthenticated, (req,res) => {
  res.render('FM/templateGallery3');
});

router.get('/all/:id',ensureAuthenticated, (req,res) => {

  To.find({user: req.params.id}).sort({creationDate:'descending'}).then(FM => {
    res.render('FM/user', {
      FM:FM
    })
  }) // find something in DB


});







router.get('/profile',ensureAuthenticated, (req,res)=>{

  To.find({}).sort({result:'descending'}).then(FM => {
    for(var i=0;i<FM.length;i++)
    {
      if(FM[i].deadDate<Date.now())
      FM.splice(i,1);
    }
    res.render('FM/profile', {
      FM:FM
    })
  })




});


router.get('/', ensureAuthenticated, (req,res) => {
// console.log(req.body);
  To.find({user: req.user.id}).sort({creationDate:'descending'}).then(FM => {
    res.render('FM/index', {
      FM:FM
    })
  }) // find something in DB
});


// add form
router.get('/add', ensureAuthenticated, (req,res) => {
  res.render('FM/add');
});

// edit form
router.get('/template/:id', ensureAuthenticated, (req,res) => {


  To.findOne({
    _id: req.params.id
  }).then(fm => {

    if(fm.deadDate<Date.now())
    {
User.findOne({_id:fm.user}).then(s=>{

  res.render('FM/over',{email:s.email});

});
  }


  else
  {

     res.render('FM/template', {
       fm: fm
     });}

  })
});





router.get('/results/:id', ensureAuthenticated, (req,res) => {

// console.log(req.user._id);

  To.findOne({
        _id: req.params.id
  }).then(fm => {

    if(fm.user==req.user._id){
     res.render('FM/results', {
       fm: fm
     });}
     else{
       res.render('FM/NA');
     }

  })



});









router.get('/open/:id/:id1', ensureAuthenticated, (req,res) => {
// console.log(req.params.id);
// console.log(req.params.id1);
  To.findOne({
    _id: req.params.id1
  }).then(fm => {

  if(fm.user==req.user._id){
    fm.user==req.user._id
    // console.log(a);
    var a=JSON.stringify(fm.result);

for(var i=0;i<fm.result.length;i++)
{
  if(fm.result[i]._id==req.params.id)
  {
    fm.note=+i;
    res.render('FM/open', {
        fm:fm,FM:fm.result[i]
      });
    // res.send('Heyia');
    break;
  }
}}
else{
  res.render('FM/NA');
}

  })
});




// process  form
router.post('/', ensureAuthenticated, (req,res) => {
  let errors = [];
console.log(req.body);
// console.log(req.query.q);
// console.log(req);

  if (!req.body.title) {
    errors.push({
      text: 'Please add title'})
  }

  if (!req.body.details) {
    errors.push({
      text: 'Please add some details' })
  }
  if(!(req.body.file||req.body.questionCheck||req.body.questionRadioR ||req.body.question)){
    errors.push({
      text: 'Please Add some Question To collect info!!!' })
  }

  if (errors.length > 0) {
    res.render('FM/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
      deadline:req.body.deadline,
      submission:req.body.submission
    });
  }



  else {

var qna=[];
var r=[];
var c=[];
var file=[];


if(req.body.question){
var imp=0;

var A;
if((typeof req.body.question)=='string')A=1;
else A=req.body.question.length;

for(var j=0;j<A;j++)
{
  var x='radio'+imp;
  imp++;

  if(req.body[x]){
    if((typeof req.body.question)=='string')
    qna.push({q:req.body.question,a:req.body[x]});
    else
  qna.push({q:req.body.question[j],a:req.body[x]});
}
  else j--;
}
}

// console.log('question');


if(req.body.file){

  var A;
if((typeof req.body.file)=='string')A=1;
else A=req.body.file.length;

if(A==1)
file.push({q:req.body.file,maxL:req.body.maxLimit,maxN:req.body.maxNumber});

else{
for(var j=0;j<A;j++)
{
  file.push({q:req.body.file[j],maxL:req.body.maxLimit[j],maxN:req.body.maxNumber[j]});
}}}



// console.log('file');


if(req.body.questionCheck){
  var note=0;
  var A;
  var imp=[];

if((typeof req.body.questionCheck)=='string')A=1;
else A=req.body.questionCheck.length;

// console.log(A);

if(A==1)
{
  imp.push(+req.body.questionCheck[0]);
    req.body.questionCheck=  req.body.questionCheck.slice(1,req.body.questionCheck.length);
    // console.log(  req.body.questionCheck);
}
else{
for(var j=0;j<A;j++)
{
imp.push(+req.body.questionCheck[j][0]);
  req.body.questionCheck[j]=  req.body.questionCheck[j].slice(1,req.body.questionCheck[j].length);
  // console.log(  req.body.questionCheck[j]);
}}


  for(var j=0;j<A;j++)
{
  var ub=[];
  for(var i=0;i<(+imp[j]);i++)
  {
    // console.log(imp[i]);
        var x='Check'+note;
    note++;
if(req.body[x])
ub.push(req.body[x]);
else i--;


}
if(A==1)
r.push({q:req.body.questionCheck,sub:ub});
else
r.push({q:req.body.questionCheck[j],sub:ub});
}


 }




 if(req.body.questionRadioR){
   var note=0;
   var A;
   var imp=[];

 if((typeof req.body.questionRadioR)=='string')A=1;
 else A=req.body.questionRadioR.length;




if(A==1)
{
  imp.push(+req.body.questionRadioR[0]);
    req.body.questionRadioR=  req.body.questionRadioR.slice(1,req.body.questionRadioR.length);
    // console.log(  req.body.questionCheck);
}
else{
for(var j=0;j<A;j++)
{
imp.push(+req.body.questionRadioR[j][0]);
  req.body.questionRadioR[j]=  req.body.questionRadioR[j].slice(1,req.body.questionRadioR[j].length);
  // console.log(  req.body.questionCheck[j]);
}}


for(var j=0;j<A;j++)
 {
   var ub=[];
   for(var i=0;i<(+imp[j]);i++)
   {
     // console.log(imp[i]);
         var x='RadioR'+note;
     note++;
     if(req.body[x])
 ub.push(req.body[x]);
else i--;
 }
if(A==1)
c.push({q:req.body.questionRadioR,sub:ub});
else
 c.push({q:req.body.questionRadioR[j],sub:ub});

 }
  }


var f=Date.now()+(req.body.deadline*60*60*1000);
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id,
    question:qna,
    check:r,
    radio:c,
    file:file,
    deadDate:f,
color:Math.floor(Math.random()*15),
times:+req.body.submission,
    };

// console.log(newUser);

    new To(newUser).save().then(fm => {
      req.user.save().then(function(result){
        req.flash('success_msg', 'Added Successfully');
        res.redirect('/FM');
      })

    })
  }
});

// edit form process
router.put('/:id', upload.array('file',12), (req,res) => {
// console.log(req.files);

  // console.log(req.body);
  To.findOne({
    _id: req.params.id
  }).then(fm => {
    // new values
// console.log(req.user);
var flag=1;var create=1;
for(var i=0;i<req.user.submission.length;i++)
{
  if(req.user.submission[i].id==fm._id)
  {
    if(+req.user.submission[i].times<+fm.times)
    {req.user.submission[i].times=+req.user.submission[i].times+1;}

     else{flag=0;}
create=0;
break;}
   else{create=1;}
}


if(flag)
{
  var urls=[];

  for(var i=0;i<req.files.length;i++)
  {
  var img = fs.readFileSync(req.files[i].path);
  var encode_image = img.toString('base64');
  // Define a JSONobject for the image attributes for saving to database

  var finalImg = {
       contentType: req.files[i].mimetype,
       image:  new Buffer(encode_image, 'base64')
    };
  mongoose.connection.db.collection('credentials').insertOne(finalImg, (err, result) => {
     // console.log(result.insertedId);

  urls.push(result.insertedId);
     if (err) return console.log(err)
       // console.log('saved to database');
  });
}

if(create){
  req.user.submission.push({id:fm._id,times:1});
}
req.user.save().then((rss)=>{
  // console.log(rss)
var qna=[];
var email=req.user.email;
var fileurl=[];
var radio=[];
var check=[];

// console.log(req.body);

// console.log(fm.check[0]);

//question
if(req.body.question){
if((typeof req.body.question)=='string'){qna.push({q:fm.question[0].q,a:req.body.question})}
else{
    for(var i=0;i<req.body.question.length;i++)
{qna.push({q:fm.question[0].q, a:req.body.question[i]});}}}


//Files
if(fm.file){
for(var i=0;i<fm.file.length;i++){fileurl.push({q:fm.file[i].q,url:urls[i]});}}

//radio
if(fm.radio){
for(var i=0;i<fm.radio.length;i++)
{radio.push({q:fm.radio[i].q,a:req.body[fm.radio[i].q+' radio']});}}


// checkbox
if(fm.check){
for(var i=0;i<fm.check.length;i++){check.push({q:fm.check[i].q,a:req.body[fm.check[i].q+' check']});}}



fm.result.push({email:email,question:qna,radio:radio,check:check,fileurl:fileurl,subDate:Date.now()});

// console.log(fm.result);
    fm.save().then( fm => {
      req.user.save().then(function(r){
        req.flash('success_msg', 'Updated Successfully');
        res.redirect('/FM');
      })});
    });
    }

  else{

User.findOne({_id:fm.user}).then(result=>{
  res.render('FM/cross',{limit:+fm.times,email:result.email})

})

    }

    });

  });
// });

router.get('/info/:id', (req, res) => {
var filename = req.params.id;

mongoose.connection.db.collection('credentials').findOne({'_id': mongoose.Types.ObjectId(filename) }, (err, result) => {

    if (err) return console.log(err)

   res.contentType('image/jpeg');
   res.send(result.image.buffer)


  })

})

// delete
router.delete('/:id', ensureAuthenticated, (req,res) => {
// console.log(req.body._method);
To.findOne({_id: req.params.id}).then(result=>{

req.user.save().then(function(){

if(req.body._method!='Stop Further Responses'){
result.deadDate=+result.deadDate+12*60*60*1000;
result.save().then(function(){
  req.flash('success_msg', 'Succcessfully Extented');
  res.redirect('/FM');
})
}

else{
result.deadDate=Date.now();
  result.save().then(function(){
    req.flash('success_msg', 'Form is Closed Succcessfully!');
    res.redirect('/FM');
  })
}

})})

});



module.exports = router;
