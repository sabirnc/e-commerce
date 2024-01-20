const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
 owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
 },
 item:[{
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    },
    quantity:{
        type:Number,
        default:1,
    },
    totalPrice:{
        type:Number,
        default:0
    }
 }],
 total:{
    type:Number,
    default:0
 }
})

const cart = mongoose.model("cart",cartSchema)
module.exports = cart