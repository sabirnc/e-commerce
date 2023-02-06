const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    products:[{
     product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
     },
     quantity:{
        type:Number,
        required:true
     },
     totalPrice:{
        type:Number,
        required:true
     }
    }],
    userAddress:[{
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

    }],
    payment:{
      type:String,
      required:[true, "choose your payment option" ]
    },
    total:{
        type:Number,
        required:true
    },
    created:{
        type:Date,
    }
})
const order = mongoose.model("order", orderSchema)
module.exports = order
   
