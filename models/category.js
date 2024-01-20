const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type:String,
    required:[true,"please enter the name of category"],
    unique:true,
    validate: {
      validator: function(value) {
        return !/[^a-zA-Z0-9 ]/.test(value);
      },
      message: "Name should not contain special characters."
    },
  },
  image: {
    type:String,
    required:[true, "upload a image   "],
  },
  disable:{
    type:Boolean,
    default:false

  }
  
})


const Category =  mongoose.model("categories" , categorySchema);
module.exports = Category