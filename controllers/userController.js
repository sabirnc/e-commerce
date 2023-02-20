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
      console.log(req.userId);
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      console.log(cart);
      const newArrivals = await products
        .find({ disable: false })
        .sort({ lastUpdated: -1 })
        .limit(4);
      res.render("homepage", { newArrivals, cart });
    } catch (err) {
      console.log(err);
    }
  },

  // GET product page
  shop_get: async (req, res) => {
    console.log(req.userId);
    try {
      const category = await Category.find({ disable: false });
      const shopProduct = await products.find({ disable: false });
      const cart = await Cart.findOne({ owner: req.userId }).populate(
        "item.product"
      );
      res.render("shop", { shopProduct, cart, category });
    } catch (err) {
      console.log(err);
    }
  },

  // GET blog page
  blog_get: async (req, res) => {
    try {
      const cart = await Cart.find({ owner: req.userId }).populate(
        "item.product"
      );
      res.render("blog", { cart });
    } catch (err) {
      console.log(err);
    }
  },

  // GET about page
  about_get: async (req, res) => {
    try {
      const cart = await Cart.find({ owner: req.userId }).populate(
        "item.product"
      );
      res.render("about", { cart });
    } catch (err) {
      console.log(err);
    }
  },

  // GET wishlist page
  wishList_get: async (req, res) => {
    try {
      const user = req.userId;
      const cart = await Cart.find({ owner: req.userId }).populate(
        "item.product"
      );
      const Wishlist = await wishlist
        .findOne({ owner: user })
        .populate("products.product");
      res.render("wishlist", { cart, Wishlist });
    } catch (err) {
      console.log(err);
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
      console.log(err);
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
      console.log(err);
    }
  },

  // GET checkout page
  checkOut_get: async (req, res) => {
    try {
      const paypalClientId =
        "AWwuzZ4gloxezuQmOCAkDaqlhRJSdje_9L-gjIyKdU7CM_DHFr6Ir8T0jU3mHHoUkDKEKyRBUu1MRlc_";
      const user = req.userId;
      const address = await userAddress.findOne({ user: user });
      const cart = await Cart.find({ owner: req.userId })
        .populate("owner")
        .populate("item.product");
      if (address == null) {
        res.render("checkout", { cart, address: null });
      } else {
        const users = await User.findOne({ _id: user });
        res.render("checkout", { cart, address: address.UserAddress, users });
      }
    } catch (err) {
      console.log(err);
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
      console.log(err);
    }
  },

  //POST updating user cart (decrement)
  decrement: async (req, res) => {
    try {
      const user = req.userId;
      if (req.body.qty <= 1) {
        res.status(200).json("delete product");
      } else {
        const product = await Products.findOne({ _id: req.body.productId });
        const cart = await Cart.updateMany(
          { owner: user, "item.product": req.body.productId },
          {
            $inc: {
              "item.$.quantity": -req.body.count,
              "item.$.totalPrice": -req.body.count * product.productPrize,
              total: -req.body.count * product.productPrize,
            },
          }
        );
        const newCart = await Cart.findOne({ owner: user }).populate(
          "item.product"
        );
        res.status(200).json({ newCart });
      }
    } catch (err) {
      console.log(err);
    }
  },

  // GET product detail page
  productDetail_get: async (req, res) => {
    try {
      const productDetail = await products.findOne({
        product_id: req.params.id,
      });
      if (productDetail) {
        res.render("product-details", { productDetail });
      } else {
        res.redirect("/");
      }
    } catch (err) {
      console.log(err);
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
    console.log(req.body);
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
    } catch (err) {
      const orderError = handleOrderErrors(err);
      console.log(orderError);
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
      console.log(err);
    }
  },

  // GET user dashboard page
  userDashboard: async (req, res) => {
    try {
      const cart = await Cart.find({ owner: req.userId }).populate(
        "item.product"
      );
      const orders = await order.find({ user: req.userId });
      const address = await userAddress.findOne({ user: req.userId });
      res.render("userDashboard", { cart, orders, address });
    } catch (err) {
      console.log(err);
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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
    }
  },

  // DELETE orders or cancelling the order
  orders: async (req, res) => {
    try {
      const orders = await order.find({ user: req.query.id });
      res.status(200).json({ orders });
    } catch (err) {
      console.log(err);
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
      console.log(order.result.id);
    } catch (err) {
      console.log(err);
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
      console.log(eachday)
      res.json({eachday});
    } catch (err) {
      console.log(err);
    }
  },

  invoice: async (req , res) => {
   try{
    const invoice = await order.findOne({_id:req.params.id}).populate("user").populate("products.product")
    console.log(invoice)
    res.render("invoice" ,{invoice})
   }
   catch(err){
    console.log(err)
   }
   
  },

  // logout user
  signOut: (req, res) => {
    res.cookie("token", "", { maxAge: 1 });
    res.redirect("/");
  },
};
