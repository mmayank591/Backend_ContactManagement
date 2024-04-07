const mongoose=require("mongoose");

const UserSchema=new mongoose.Schema({
name:{
  type:String,
  required:[true,"name is a required field"]
},
email:{
  type:String,
  required:[true,"name is a required field"]
},
password:{
  type:String,
  required:[true,"password is required"]
},
});

module.exports=mongoose.model("User",UserSchema);






