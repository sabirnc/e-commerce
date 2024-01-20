const mongoose = require("mongoose")
const userAddressSchema = new mongoose.Schema({
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    UserAddress : [{
        firstName:{
            type:String,
            required:[true , "please enter your firstname"]
        },
        lastName:{
            type:String,
            required:[true, "please enter your lastname"]
        },
        country:{
            type:String,
            required:[true , 'plese enter your country']
        },
        streetAdress:{
            type:String,
            required:[true, "please enter your street address"]
        },
        city:{
            type:String,
            required:[true , "please enter your city"]
        },
        state:{
            type:String,
            required:[true, "please enter your state"]
        },
        postcode:{
            type:Number,
            required:[true , "please enter your postcode"]
        },
        phoneNumber:{
            type:Number,
            required:[true, "enter your phone number"]
        },
        email:{
            type:String,
            required:[true , "enter your email"]
        }
    }]
})

const address = mongoose.model("address", userAddressSchema)
module.exports = address