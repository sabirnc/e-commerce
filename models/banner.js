const mongoose = require("mongoose")
const bannerSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
        
    },
    image:{
        type:String,
        required:true
    },
    selected:{
       type : Boolean,
       default:false
    }
})

const banner = mongoose.model("banner" , bannerSchema)
module.exports = banner