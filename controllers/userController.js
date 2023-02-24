const products = require("../models/adminProduct");
const User = require("../models/user");
const Cart = require("../models/cart");
const jwt = require("jsonwebtoken");
const { mongoose } = require("mongoose");
const order = require("../models/order");
const Products = require("../models/adminProduct");
const Coupons = require("../models/coupon");
const Category = require("../models/category");
const wishlist = require("../models/whishlist");
const userAddress = require("../models/userAddress");
const banner = require("../models/banner")
const {cloudinary} = require("./adminController")
const bcrypt = require("bcrypt");
const paypal = require("@paypal/checkout-server-sdk");
const paypalClientId =
  "AWwuzZ4gloxezuQmOCAkDaqlhRJSdje_9L-gjIyKdU7CM_DHFr6Ir8T0jU3mHHoUkDKEKyRBUu1MRlc_";
const secret =
  "EA4t-d302stn80SM5EtzdO0Gpss20EUdq3H9AiW6SxrpIza6lNpiXdxuqpsWIpIqS6GG1whK_0psn64J";
let enviorment = new paypal.core.SandboxEnvironment(paypalClientId, secret);
const paypalClient = new paypal.core.PayPalHttpClient(enviorment);
const randomId = require("random-id");
const {
  SandboxEnvironment,
} = require("@paypal/checkout-server-sdk/lib/core/lib");
const len = 10;
const pattern = "0";
const handleErrors = (err) => {
  const errors = {
    fullName: "",
    userName: "",
    password: "",
    email: "",
    phoneNumber: "",
  };

  // if (err.name === "ValidationError") {
  //   errors.phoneNumber = "invalid number";
  //   return errors;
  // }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  // setting error unique for unique values

  if (err.code === 11000) {
    if (err.keyPattern.userName == 1) {
      errors.userName = "this username was already taken";
    } else if (err.keyPattern.email == 1) {
      errors.email = "this email is already registered";
    } else {
      errors.phoneNumber = "this  phone number is already registered";
    }
  }
  return errors;

  // console.log(orderErrors)
};

const handleOrderErrors = (err) => {
  const orderErrors = {
    payment: "",
  };
  if (err.message.includes("order validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      orderErrors[properties.path] = properties.message;
    });
  }
  console.log(err);

  return orderErrors;
};

const handleAddrssError = (err) => {
  const addressError = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    streetAdress: "",
    city: "",
    state: "",
    country: "",
    postcode: "",
  };
  if (err.message.includes("address validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      addressError[properties.path] = properties.message;
      addressError[properties.path] = properties.message;
    });
  }

  if (err.reason.path) {
    const error = err.reason.path;
    return error;
  }

  return addressError;
};

module.exports = {
  // GET login page
  login_get: (req, res) => {
    res.render("authentication");
  },

  // POST login details
  login: async (req, res) => {
    const { userName, password } = req.body;

    try {
      const user = await User.login(userName, password);
      const payload = {
        id: user._id,
      };
      const token = jwt.sign(payload, process.env.secret, { expiresIn: "24h" });
      res
        .cookie("token", token)
        .json({ message: "authentication successfull" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // GET Signup page
  signup_get: (req, res) => {
    res.render("signup");
  },

  // POST singup details
  signup: async (req, res) => {
    const { fullName, userName, password, email, phoneNumber } = req.body;

    try {
      const user = await User.create({
        fullName,
        userName,
        password,
        email,
        phoneNumber,
        status: true,
        created: Date.now(),
      });
      res.status(200).json({ user });
    } catch (err) {
      const error = handleErrors(err);
      res.status(400).json({ error, msg: "bad request" });
    }
  },

  // GET home page
  home_get: async (req, res) => {
    try {
      const banners = await banner.find({selected:true})
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      const newArrivals = await products
        .find({ disable: false })
        .sort({ lastUpdated: -1 })
        .limit(4);
      res.render("homepage", { newArrivals, cart ,banners });
    } catch (err) {
      res.status(400).json({err:err.message})
    }
  },

  // GET product page
  shop_get: async (req, res) => {
    try {
      const category = await Category.find({ disable: false });
      const shopProduct = await products.find({ disable: false });
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      res.render("shop", { shopProduct, cart, category });
    } catch (err) {
      res.status(400).json({message:err.message})
    }
  },

  // GET blog page
  blog_get: async (req, res) => {
    try {
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      res.render("blog", { cart });
    } catch (err) {
      res.status(400).json({err:err.message})
    }
  },

  // GET about page
  about_get: async (req, res) => {
    try {
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      res.render("about", { cart });
    } catch (err) {
      res.status(400).json({err:err.message})
    }
  },

  // GET wishlist page
  wishList_get: async (req, res) => {
    try {
      const user = req.userId;
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      const Wishlist = await wishlist
        .findOne({ owner: user })
        .populate("products.product");
      res.render("wishlist", {  Wishlist ,cart });
    } catch (err) {
      res.status(400).json({err:err.message})
    }
  },

  // GET cart page
  cart_get: async (req, res) => {
    try {
      const cart = await Cart.findOne({ owner: req.userId });
      if (cart != null) {
        const cart = await Cart.findOne({ owner: req.userId })
          .populate("owner")
          .populate("item.product");
        res.render("cart", { cart });
      } else {
        res.render("cart", { cart });
      }
    } catch (err) {
      res.status(400).json({err:err.message})
    }
  },

  // POST adding to cart
  addToCart: async (req, res) => {
    const { productId, userId, productPrize, qty } = req.body;
    try {
      const userCart = await Cart.findOne({ owner: userId });
      if (userCart) {
        const productExistInCart = await Cart.find({
          item: { $elemMatch: { product: productId } },
        });
        if (productExistInCart.length > 0) {
          const update = await Cart.updateOne(
            { owner: userId, "item.product": productId },
            {
              $inc: {
                "item.$.quantity": qty,
                "item.$.totalPrice": qty * productPrize,
                total: qty * productPrize,
              },
            }
          );
        } else {
          await Cart.updateOne(
            { owner: userId },
            {
              $push: {
                item: {
                  product: mongoose.Types.ObjectId(productId),
                  quantity: qty,
                  totalPrice: qty * productPrize,
                },
              },
              $inc: { total: qty * productPrize },
            }
          ).then(() => userCart.save());
        }
        res.json({ message: "success" });
      } else {
        const cart = await new Cart({
          owner: mongoose.Types.ObjectId(userId),
          item: [
            {
              product: mongoose.Types.ObjectId(productId),
              quantity: qty,
              totalPrice: qty * productPrize,
            },
          ],
          total: qty * productPrize,
        });
        const result = await cart.save();
        res.json({ message: "success" });
      }
    } catch (err) {
      res.json({ error: err });
    }
  },

  //DELETE cart products
  deleteItem: async (req, res) => {
    const { id, qty, total } = req.body;
    try {
      const products = await Cart.updateMany(
        { owner: req.userId },
        { $inc: { total: -total }, $pull: { item: { product: id } } }
      );
      const cart = await Cart.findOne({ owner: req.userId });
      res.json({ message: "success" });
    } catch (err) {
      res.status(400).json({err:err.message})
    }
  },

  // GET checkout page
  checkOut_get: async (req, res) => {
    try {
      const paypalClientId =
        "AWwuzZ4gloxezuQmOCAkDaqlhRJSdje_9L-gjIyKdU7CM_DHFr6Ir8T0jU3mHHoUkDKEKyRBUu1MRlc_";
      const user = req.userId;
      const address = await userAddress.findOne({ user: user });
      const cart = await Cart.findOne({ owner: req.userId })
        .populate("owner")
        .populate("item.product");
      if (address == null) {
        res.render("checkout", {  address: null ,cart });
      } else {
        const users = await User.findOne({ _id: user });
        res.render("checkout", {  address: address.UserAddress, users , cart });
      }
    } catch (err) {
      res.status(400).json({err:err.message})
    }
  },

  // POST increment cart quantity
  increment: async (req, res) => {
    try {
      const user = req.userId;
      const product = await Products.findOne({
        _id: req.body.productId,
        productInStock: { $gte: 1 },
      });
      if (product == null) {
        res.status(200).json({ message: "out of stock" });
      } else {
        const cart = await Cart.updateMany(
          { owner: user, "item.product": req.body.productId },
          {
            $inc: {
              "item.$.quantity": req.body.count,
              "item.$.totalPrice": req.body.count * product.productPrize,
              total: req.body.count * product.productPrize,
            },
          }
        );
        const newCart = await Cart.findOne({ owner: user }).populate(
          "item.product"
        );
        res.status(200).json({ newCart });
      }
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  //POST updating user cart (decrement)
  decrement: async (req, res) => {
    try {
      const user = req.userId;
      if (req.body.qty < 1) {
        res.status(200).json("delete product");
      } else {
        const product = await Products.findOne({ _id: req.body.productId });
        const cart = await Cart.updateMany(
          { owner: user, "item.product": req.body.productId},
          {
            $set: {
              "item.$.quantity": req.body.qty,
              "item.$.totalPrice": req.body.qty * product.productPrize,
            },
           $inc:{
            total:-req.body.count * product.productPrize
           }
            
            
          }
        );
        const newCart = await Cart.findOne({ owner: user }).populate(
          "item.product"
        );
        res.status(200).json({ newCart });
      }
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  // GET product detail page
  productDetail_get: async (req, res) => {
    try {
      const cart = await Cart.findOne({owner:req.userId}).populate("item.product")
      const productDetail = await products.findOne({
        product_id: req.params.id,
      });
      const mayLike = await products.find({productCategory:productDetail.productCategory}).limit(4)
      if (productDetail) {
        res.render("product-details", { productDetail  , mayLike , cart});
      } else {
        res.redirect("/");
      }
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  // POST add address to the user address collectiom
  addAddress: async (req, res) => {
    try {
      const user = req.userId;
      const {
        firstName,
        lastName,
        companyName,
        country,
        streetAdress,
        city,
        state,
        postcode,
        phone,
        email,
      } = req.body;
      const address = await userAddress.findOne({ user: user });
      if (address == null) {
        const newAddress = new userAddress({
          user: mongoose.Types.ObjectId(user),
          UserAddress: [
            {
              firstName: firstName,
              lastName: lastName,
              streetAdress: streetAdress,
              city: city,
              postcode: postcode,
              state: state,
              phoneNumber: phone,
              country: country,
              email: email,
            },
          ],
        });
        await newAddress.save();
        res.status(200).json({ message: "oK" });
      } else {
        const updateAddress = await userAddress.updateOne(
          { user: user },
          {
            $push: {
              UserAddress: {
                firstName: firstName,
                lastName: lastName,
                streetAdress: streetAdress,
                city: city,
                postcode: postcode,
                state: state,
                phoneNumber: phone,
                country: country,
                email: email,
              },
            },
          },
          { upsert: true }
        );
        res.status(200).json({ message: "oK" });
      }
    } catch (err) {
      const error = handleAddrssError(err);
      res.status(400).json({ error });
    }
  },

  // POST edit user address
  editAddress: async (req, res) => {
    try {
      const address = await userAddress.updateMany(
        { "UserAddress._id": req.body.id },
        {
          $set: {
            "UserAddress.$.firstName": req.body.name,
            "UserAddress.$.streetAdress": req.body.streetAdress,
            "UserAddress.$.phoneNumber": req.body.phoneNumber,
            "UserAddress.$.city": req.body.city,
            "UserAddress.$.state": req.body.state,
            "UserAddress.$.country": req.body.country,
            "UserAddress.$.postcode": req.body.postcode,
          },
        }
      );
      const user = await userAddress.findOne({
        "UserAddress._id": req.body.id,
      });
      res.status(200).json({ user });
    } catch (err) {
      res.status(400).json({ error: err.path });
    }
  },

  // DELETE  user address
  deleteAddress: async (req, res) => {
    try {
      const { id } = req.body;
      const user = req.userId;
      const address = await userAddress.updateMany(
        { user: user },
        {
          $pull: {
            UserAddress: {
              _id: id,
            },
          },
        }
      );
      res.status(200).json({ message: "oK" });
    } catch (err) {
      console.log(err);
    }
  },

  // POST placing order
  placeOrder: async (req, res) => {
    try {
      const user = req.userId;
      const cart = await Cart.findOne({ owner: user });
      if (cart.item.length < 1) {
        const noitem = "null";
        res.status(400).json({ noitem });
      } else {
        const newOrder = new order({
          orderId: randomId(len, pattern),
          user: mongoose.Types.ObjectId(req.userId),
          products: cart.item,
          payment: req.body.paymentMethod,
          address: req.body.detail,
          total: cart.total,
          created: Date.now(),
        });

        await newOrder.save();
        for (i = 0; i < cart.item.length; i++) {
          const update = await Products.updateOne(
            { _id: cart.item[i].product },
            { $inc: { productInStock: -cart.item[i].quantity } },
            { upsert: true }
          ).catch((err) => console.log(err));
        }
        const removeProductsCart = await Cart.updateMany(
          { owner: req.userId },
          { $set: { item: [] }, total: 0 }
        );
        const updateUser = await User.updateOne(
          { _id: req.userId },
          { $set: { couponApplied: false } }
        );
        res.status(200).json({ message: "success" });
      }
    }catch (err) {
      const orderError = handleOrderErrors(err);
      res.status(400).json({ orderError });
    }
  },

  // DELETE canceling order
  cancelOrder: async (req, res) => {
    try {
      const { id } = req.body;
      const cancelOrder = await order.deleteOne({ _id: id });
      res.status(200).json({ message: "oK" });
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  // GET user dashboard page
  userDashboard: async (req, res) => {
    try {
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      const orders = await order.find({ user: req.userId });
      const address = await userAddress.findOne({ user: req.userId });
      const user = await User.findOne({_id:req.userId})
      res.render("userDashboard", { cart, orders, address ,user });
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  // POST applying coupon
  applyCoupon: async (req, res) => {
    const coupons = await Coupons.findOne({
      couponCode: req.body.coupon,
      quantity: { $gt: 0 },
    });
    const cart = await Cart.findOne({ owner: req.userId });
    const user = await User.findOne({ _id: req.userId });
    if (coupons == null) {
      res.json({ message: "invalid coupon" });
    }
    if (cart.total > 500 && user.couponApplied == false) {
      const applyCoupon = await Cart.updateOne(
        { owner: req.userId },
        { $inc: { total: -coupons.discountRate } },
        { upsert: true }
      );
      const userUpdate = await User.updateOne(
        { _id: req.userId },
        { $set: { couponApplied: true, coupons: req.body.coupon } }
      );
      res.json({ coupons: coupons });
    } else {
      res.json({ message: "not eligible for this offer  " });
    }
  },

  // POST remove coupon
  removeCoupon: async (req, res) => {
    try {
      const user = req.userId;
      const removeappliedCoupon = await User.findOne({ _id: user });
      const removeUserappliedCoupon = await User.updateMany(
        { _id: user },
        { $set: { coupons: "", couponApplied: false } }
      );
      const coupon = await Coupons.findOne({
        couponCode: removeappliedCoupon.coupons,
      });
      const cart = await Cart.updateMany(
        { owner: user },
        { $inc: { total: coupon.discountRate } }
      );
      const decrementCouponCount = await Coupons.updateMany(
        { couponCode: removeUserappliedCoupon.coupons },
        { $inc: { quantity: -1 } }
      );
      res.status(200).json({ message: "oK" });
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  // GET query filter product on basis of category in product page
  filterProduct: async (req, res) => {
    try {
      const product = await Products.find({
        productCategory: req.query.category,
      });
      res.json({ data: product, user: req.userId });
    } catch (err) {
       res.status(400).res.json({err:err.message})
    }
  },

  // POST adding product to whishlist
  addToWishlist: async (req, res) => {
    try {
      const { id } = req.body;
      const user = req.userId;
      const checkWishlistExist = await wishlist.findOne({ owner: user });
      if (checkWishlistExist == null) {
        const Wishlist = new wishlist({
          owner: mongoose.Types.ObjectId(user),
          products: [
            {
              product: mongoose.Types.ObjectId(id),
            },
          ],
        });
        Wishlist.save();
      } else {
        const Wishlist = await wishlist.findOne({
          owner: user,
          products: { $elemMatch: { product: id } },
        });
        if (Wishlist == null) {
          const updateWishlist = await wishlist.updateMany(
            { owner: user },
            { $push: { products: { product: id } } }
          );
        } else {
          res.status(200).json({ message: "product already added" });
        }
      }
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  // DELETE product from the whishlist
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.body;
      const user = req.userId;
      const deleteWishlist = await wishlist.updateMany(
        { owner: user },
        { $pull: { products: { product: id } } }
      );
      res.status(200).json({ message: "Ok" });
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  // DELETE orders or cancelling the order
  orders: async (req, res) => {
    try {
      const orders = await order.find({ user: req.query.id });
      res.status(200).json({ orders });
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  // POST
  createPaypalOrder: async (req, res) => {
    try {
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      const request = new paypal.orders.OrdersCreateRequest();
      const total = cart.total;
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: cart.total,
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: cart.total,
                },
              },
            },
            items: cart.item.map((item) => {
              return {
                name: item.product.productName,
                unit_amount: {
                  currency_code: "USD",
                  value: item.product.productPrize,
                },
                quantity: item.quantity,
              };
            }),
          },
        ],
      });
      const order = await paypalClient.execute(request);
      res.json({ id: order.result.id });
    } catch (err) {
      console.log(err)
    }
  },

  // GET total orders

  totalOrders: async (req, res) => {
    try {
      const eachday = await order.aggregate([
        {
          $match: {
            created: {
              $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$created" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
      res.json({eachday});
    } catch (err) {
      res.status(400).res.json({err:err.message})
    }
  },

  invoice: async (req , res) => {
   try{
    const invoice = await order.findOne({_id:req.params.id}).populate("user").populate("products.product")
    res.render("invoice" ,{invoice})
   }
   catch(err){
    res.send(err.message)
  
   }
   
  },

  uploadProfilePhoto: async (req , res) => {
   
    try{
     let file
     const upload =  await cloudinary.uploader.upload(req.file.path , function(err , result){
      file = result.url
     })
     const update = await User.updateOne(
      {_id:req.userId},
      {profile:file},
      {upsert:true}
     )
     const profile = await User.findOne({_id:req.userId})
     res.status(200).json({profile:profile.profile})
    }
    catch(err){
      res.send(err.message)
    }
 
  },  
  updateProfile:async (req , res) => {
   console.log("hello")
   try{
    const {fullName , userName , email , currentPassword , newPassword} = req.body
    const user = await User.findOne({_id:req.userId})
    const checkcurrentPassword = await bcrypt.compare(req.body.currentPassword ,user.password)
    console.log(checkcurrentPassword)
    if(!currentPassword.length){
      console.log("hii")
      const update = await User.updateOne(
        {_id:req.userId},
        {
          $set:{
            fullName:fullName,
            userName:userName,
            email:email,
          }
        }
      )
      res.status(200).json({message:"oK"})
    }
    if(checkcurrentPassword){

      if(!newPassword.length){
        res.json({new:"enter your password"})
      }else{
        const salt = await bcrypt.genSalt()
      const newPasswordHashed = await bcrypt.hash(newPassword , salt)
      const userUpdate = await User.updateMany(
        {_id:req.userId},
        {
          $set:{
            fullName:fullName,
            userName:userName,
            email:email,
            password:newPasswordHashed
          }
        }
      )
      res.status(200).json({message:"oK"})
      }
      
    }else{
      console.log("hee")
      res.json({pass:"password is incorrect"})
    }
   
   
   }
   catch(err){
    console.log(err)
    res.send({err:err.code , path:err.keyValue})
   }
  },

  // logout user
  signOut: (req, res) => {
    res.cookie("token", "", { maxAge: 1 });
    res.redirect("/");
  },
};
