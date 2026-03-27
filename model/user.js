require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

let userschema = mongoose.Schema({
    fullname : String,
    name:String,
    email:String,
    password:String,
    number:Number,
    post:[{
        type:mongoose.Schema.Types.ObjectId,ref:"post"
    }]

})

module.exports = mongoose.model("user",userschema);