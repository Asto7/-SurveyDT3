const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const A=new Schema({q:String,a:String});
const R=new Schema({q:String,sub:[String]});
const C=new Schema({q:String,sub:[String]});
const B=new Schema({
  color:Number,
  email:String,
  question:[new Schema({q:String,a:String})],
  radio:[new Schema({q:String,a:String})],
  check:[new Schema({q:String,a:[String]})],
  fileurl:[new Schema({q:String,url:String})],
  subDate: {
    type: Date,
    default: Date.now
  },


});

// create schema
const fmSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
question:[A],
radio:[R],
check:[C],
result:[B],

file:[new Schema({q:String,maxL:Number,maxN:Number})],

note:{type:Number},
limit:{type:String,
default:0
},

deadDate: {
  type: Date,
  default: Date.now
},
  creationDate: {
    type: Date,
    default: Date.now
  },
  times:{type:Number,default:1},
  color:{type:Number,
  default:Math.floor(Math.random()*15)}



});

mongoose.model('FM', fmSchema);
