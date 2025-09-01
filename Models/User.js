const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,  
    username: String,       
    email:String, 
    password:String,
    role:String,
    bio:String,
    avatar: String,
    website: String, 
}, { timestamps:true })

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;