const mongoose = require("mongoose")
const Category = require("./category")

const couponSchema = new mongoose.Schema({
 
    couponName: {
        type:String,
        required:true,
        lowercase:true
    },
    couponCode: {
        type:String,
        required:true
    },
    startDate: {
        type:Date,
        required:true
    },
    endDate: {
        type:Date,
        required:true
    },
    shipping:{
        type:Boolean,
    },
    quantity:{
        type:Number,
        required:true
    },
    discountRate: {
        type:Number,
        required:true
    },
    

})

const Coupons = mongoose.model("coupons" , couponSchema)
module.exports = Coupons