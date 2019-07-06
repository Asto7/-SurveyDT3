const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const A=new Schema({title:String,email:String,Amount:String,requestDate:{
//   type: Date,
//   default:null
//
// }});

// create schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
submission:[new Schema({id:String,times:{type:Number,default:0}})]
});

mongoose.model('users', UserSchema);
