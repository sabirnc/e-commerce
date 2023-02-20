const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productColor: {
    type: String,
    required: true,
  },
  productSize: {
    type: String,
    required: true,
  },
  productPrize: {
    type: Number,
    required: true,
  },
  productInStock: {
    type: Number,
    required: true,
  },
  productCategory: {
    type: String,
    required: true,
  },
  productImage: {
    type: Array,
    required: true,
  },
  disable:{
    type:Boolean,
    default:false
  },
  lastUpdated: {
    type: Date,
  },
});

const Products = mongoose.model("products", productSchema);
module.exports = Products;
