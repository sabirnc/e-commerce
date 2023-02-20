const mongoose = require("mongoose");
const wishlistSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    products:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"products",
            }
        }
    ]
})

const whishlist = mongoose.model("whishlists", wishlistSchema)
module.exports = whishlist
