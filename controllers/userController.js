const products = require("../models/adminProduct");
const User = require("../models/user");
const Cart = require("../models/cart");
const jwt = require("jsonwebtoken");
const { mongoose } = require("mongoose");
const order = require("../models/order");
const Products = require("../models/adminProduct");
const Coupons = require("../models/coupon");
const Category = require("../models/category");
const { updateOne } = require("../models/adminProduct");

const handleErrors = (err) => {
  const errors = {
    fullName: "",
    userName: "",
    password: "",
    email: "",
  };

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
  // console.log(orderErrors)
  return errors;
};

const handleOrderErrors = (err) => {
  const orderErrors = {
    userAddress: [
      {
        firstName: "",
        lastName: "",
        country: "",
        streetAdress: "",
        city: "",
        postcode: "",
        state: "",
        email: "",
        phoneNumber: "",
      },
    ],
    payment: "",
  };

  if (err.message.includes("order validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      orderErrors.userAddress[0][properties.path] = properties.message;
      orderErrors[properties.path] = properties.message;
    });
  }

  return orderErrors;
};

module.exports = {
  login_get: (req, res) => {
    res.render("authentication");
  },

  login: async (req, res) => {
    const { userName, password } = req.body;

    try {
      const user = await User.login(userName, password);
      const payload = {
        id: user._id,
      };
      const token = jwt.sign(payload, process.env.secret, { expiresIn: "24h" });
      res.cookie("token", token);
      res.json({
        message: "authentication successfull",
      });
    } catch (err) {
      const { message } = err;
      res.status(400).json({ message });
    }
  },
  signup_get: (req, res) => {
    res.render("signup");
  },
  signup: async (req, res) => {
    console.log(req.body);
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
      res.status(400).json({ error });
      console.log(error);
    }
  },
  home_get: async (req, res) => {
    try {
      console.log(req.userId);
      const cart = await Cart.find({ owner: req.userId }).populate(
        "item.product"
      );
      console.log(cart);
      const newArrivals = await products
        .find({})
        .sort({ lastUpdated: -1 })
        .limit(4);
      res.render("homepage", { newArrivals, cart });
    } catch (err) {
      console.log(err);
    }
  },

  shop_get: async (req, res) => {
    try {
      const category = await Category.find({disable:false});
      const shopProduct = await products.find({});
      const cart = await Cart.find({ owner: req.userId }).populate(
        "item.product"
      );
      console.log(cart);
      res.render("shop", { shopProduct, cart, category });
    } catch (err) {
      console.log(err);
    }
  },

  blog_get: async (req, res) => {
    const cart = await Cart.find({ owner: req.userId }).populate(
      "item.product"
    );
    res.render("blog", { cart });
  },

  about_get: async (req, res) => {
    const cart = await Cart.find({ owner: req.userId }).populate(
      "item.product"
    );
    res.render("about", { cart });
  },

  wishList_get: async (req, res) => {
    const cart = await Cart.find({ owner: req.userId }).populate(
      "item.product"
    );
    res.render("wishlist", { cart });
  },

  cart_get: async (req, res) => {
    try {
      const cart = await Cart.find({ owner: req.userId });
      if (cart.length > 0) {
        const cart = await Cart.find({ owner: req.userId })
          .populate("owner")
          .populate("item.product");
        res.render("cart", { cart });
      } else {
        console.log("else case");
        res.render("cart", { cart });
      }
    } catch (err) {
      console.log(err);
    }
  },

  addToCart: async (req, res) => {
    const { productId, userId, productPrize, qty } = req.body;
    try {
      const userCart = await Cart.findOne({ owner: userId });
      if (userCart) {
        const productExistInCart = await Cart.find({
          item: { $elemMatch: { product: productId } },
        });
        console.log(productExistInCart);
        if (productExistInCart.length > 0) {
          console.log("product is matching");
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
          console.log("we will do this");
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
          ).then(() => userCart.save(() => console.log("document saved ")));
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

  deleteItem: async (req, res) => {
    const { id, qty, total } = req.body;
    try {
      const products = await Cart.updateMany(
        { owner: req.userId },
        { $inc: { total: -total }, $pull: { item: { product: id } } }
      );
      res.json({ message: "success" });
    } catch (err) {
      console.log(err);
    }
  },

  checkOut_get: async (req, res) => {
    const cart = await Cart.find({ owner: req.userId })
      .populate("owner")
      .populate("item.product");
    res.render("checkout", { cart });
  },

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
  placeOrder: async (req, res) => {
    const productIds = [];
    const userCart = await Cart.findOne({ owner: req.userId });

    try {
      const newOrder = new order({
        user: mongoose.Types.ObjectId(req.userId),
        products: userCart.item,
        userAddress: [
          {
            firstName: req.body.firstName,
            lastName: req.body.country,
            streetAdress: req.body.houseName,
            city: req.body.city,
            postcode: req.body.postcode,
            state: req.body.state,
            phoneNumber: req.body.phone,
            country: req.body.country,
            email: req.body.email,
          },
        ],
        payment: req.body.paymentMethod,
        total: userCart.total,
        created: Date.now(),
      });

      await newOrder.save();
      for (i = 0; i < userCart.item.length; i++) {
        const update = await Products.updateOne(
          { _id: userCart.item[i].product },
          { $inc: { productInStock: -userCart.item[i].quantity } },
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
    } catch (err) {
      console.log("hello erros");
      const orderError = handleOrderErrors(err);
      res.status(400).json({ orderError });
    }
  },
  userDashboard: async (req, res) => {
    const cart = await Cart.find({ owner: req.userId }).populate(
      "item.product"
    );
    res.render("userDashboard", { cart });
  },
  applyCoupon: async (req, res) => {
    const coupons = await Coupons.findOne({ couponCode: req.body.coupon });
    const cart = await Cart.findOne({ owner: req.userId });
    console.log(coupons);
    console.log(cart);
    const user = await User.findOne({ _id: req.userId });
    console.log(user);

    if (coupons == null) {
      res.json({ message: "invalid coupon" });
    }
    if (cart.total > 500 && user.couponApplied == false) {
      const applyCoupon = await Cart.updateOne(
        { owner: req.userId },
        { $inc: { total: -coupons.discountRate } },
        { upsert: true }
      );
      console.log(applyCoupon);
      const userUpdate = await User.updateOne(
        { _id: req.userId },
        { $set: { couponApplied: true } }
      );
      console.log(userUpdate);
      res.json({ coupons: "coupon applied" });
    } else {
      res.json({ message: "not eligible for this offer  " });
    }
  },
  filterProduct: async (req, res) => {
    console.log(req.query.category);
    const product = await Products.find({
      productCategory: req.query.category,
    });
    res.json({ data: product });
  },

  signOut: (req, res) => {
    res.cookie("token", "", { maxAge: 1 });
    res.redirect("/");
  },
};
