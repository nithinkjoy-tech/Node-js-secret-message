const mongoose=require("mongoose")

const messages=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    cookie:{
        type:String,
        required:true
    },
    messages:{
        type:Array
    }
})

const Messages=mongoose.model("messages",messages)

module.exports=Messages