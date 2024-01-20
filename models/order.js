const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId:{
      type:String,
    },
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
    payment:{
      type:String,
      required:[true, "choose your payment option" ]
    },
    status:{
        type:String,
        default:"order confirmed"
    },
    total:{
        type:Number,
        required:true
    },
    address:{
      type:Object
    },
    created:{
        type:Date,
    }
})
const order = mongoose.model("order", orderSchema)
module.exports = order
   
