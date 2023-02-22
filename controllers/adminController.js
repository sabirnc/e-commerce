const category = require("../models/category");
const Products = require("../models/adminProduct");
const Category = require("../models/category");
const Coupons = require("../models/coupon");
const User = require("../models/user");
const Order = require("../models/order");
const userAddress = require("../models/userAddress");
const jwt = require("jsonwebtoken");
const randomId = require("random-id");
const order = require("../models/order");
const cloudinary = require("cloudinary").v2
const len = 10;
const pattern = "aA0";
const adminUserName = "sabir";
const adminPassword = "1234";

// configuring cloudinary 
cloudinary.config({ 
  cloud_name: 'dkoczwl2d', 
  api_key: '658853366911788', 
  api_secret: '7R26H5ToEac-dAEMc7OfGeYmtxg',
  secure: true 
});

// handling errors
const handleErrors = (err) => {
  const errors = {
    name: "",
    image: "",
    productName: "",
    productInStock: "",
    productSize: "",
    productPrize: "",
    productCategory: "",
  };
  if (err.message.includes("categories validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  if (err.code == 11000) {
    if (err.keyPattern.name == 1) {
      errors.name = "this category is already registered";
    }
  }
  return errors;
};

module.exports = {

  // GET signin page 
  admin_signIn: (req, res) => {
    res.render("adminsignup");
  },


  // POST signin details
  admin_post: (req, res) => {
    const { userName, password } = req.body;
    if (adminUserName === userName && adminPassword == password) {
      const payload = { user: adminUserName };
      const adminToken = jwt.sign(payload, process.env.secret, {
        expiresIn: "24h",
      });
      res.cookie("adminToken", adminToken);
      res.json({ message: "success" });
    } else {
      res.json({ message: "invalid user name or password" });
    }
  },


  // logout admin 
  logout: (req, res) => {
    res.cookie("adminToken", "", { maxAge: 1 });
    res.redirect("/admin/signin");
  },


  // GET admin homepage
  admin_get: async (req, res) => {
    try{
      const newOrders = await order.find({}).sort({created:-1}).limit(5)
      res.render("adminHome",{newOrders});
    }
    catch(err){
      res.json({err:err.message})
    }
    
  },


  // GET category page
  adminCategory_get: async (req, res) => {
    const result = await category.find({});
    res.render("adminCategory", { result });
  },


  // GET add category page 
  adminAddCategory_get: (req, res) => {
    res.render("adminAddCategory");
  },


  // POST catergory details 
  adminAddCategory_post: async (req, res) => {
    try {
      const categoryDetails = new category({
        name: req.body.categoryname,
        image: req.file.originalname,
      });

      const result = await categoryDetails.save();
      res.status(200).json({ data: "ok" });
    } catch (e) {
      const error = handleErrors(e);
      res.status(400).json({ error });
    }
  },



  // POST disabling category 
  disableCategory: async (req, res) => {
    const disableCategory = await Category.updateOne(
      { _id: req.body.id },
      [{ $set: { disable: { $not: "$disable" } } }],
      { upsert: true }
    );
    const category = await Category.findOne({ _id: req.body.id });
    res.status(200).json({ data: category.disable });
  },



  // GET product page 
  adminProducts_get: async (req, res) => {
    const result = await Products.find({});
    const categories = await Category.find({ disable: false });
    res.render("adminProducts", { products: result, categories });
  },


  // GET product detail page 
  adminProductDetails_get: (req, res) => {
    res.render("adminProductDetail");
  },



  // GET product page 
  adminAddProduct_get: async (req, res) => {
    const result = await category.find({ disable: false });
    res.render("adminAddProducts");
  },

  adminProductDetails_get: async (req, res) => {
    res.render("adminProductDetail");
  },


  // GET add product page 
  adminAddproducts_get: async (req, res) => {
    const result = await category.find({ disable: false });
    res.render("adminAddProducts", { category: result });
  },



  // POST product details 
  adminAddproduct_post: async (req, res) => {
    try {
      const urlList = []
      for(i=0;i<req.files.length; i++){
        const upload =  await  cloudinary.uploader.upload(req.files[i].path , function(err , result){
          urlList.push(result.url)
        })
      }
      const product = new Products({
        product_id: randomId(len, pattern),
        productName: req.body.productName,
        productColor: req.body.productColor,
        productInStock: req.body.productInStock,
        productPrize: req.body.productPrize,
        productSize: req.body.productSize,
        productImage: req.files.map((file) => file.originalname),
        urlList:urlList.map(file => file),
        productCategory: req.body.productCategory,
        lastUpdated: Date.now(),
      });
      const result = await product.save();
      res.json({ message: "success" });
    } catch (e) {
      const error = handleErrors(e);
      res.status(400).json({ error });
    }
  },



  // GET orders page
  adminOrders_get: async (req, res) => {
    try {
      const orders = await Order.find({}).populate("user").populate("products");
      res.render("adminOrders", { orders });
    } catch (err) {
      res.json({err:err.message})
    }
  },


  // GET order detail page 
  adminOrderDetails_get: async (req, res) => {
    try {
      const orderDetails = await Order.findById(req.params.id)
        .populate("user")
        .populate("products.product");
      const user = orderDetails.user._id;
      res.render("adminOrderDetails", { orderDetails });
    } catch (err) {
      res.json({err:err.message})
    }
  },



  // POST  update order status
  orderStatus: async (req, res) => {
    try {
      const orderStatus = await Order.updateMany(
        { _id: req.body.id },
        { $set: { status: req.body.status } },
        { upsert: true }
      );
    } catch (err) {
      res.json({err:err.message})
    }
  },


  // GET customers page 
  adminCustomers_get: async (req, res) => {
    try {
      const users = await User.find({});
      const orders = await order.find({});
      res.render("adminCustomers", { users });
    } catch (err) {
      res.json({err:err.message})
    }
  },



  //  POST updating customer status 
  customer_status: async (req, res) => {
    const { id } = req.body;
    try {
      const changeStatus = await User.updateOne(
        { _id: id },
        [{ $set: { status: { $not: "$status" } } }],
        { upsert: true }
      );
      const status = await User.findOne({ _id: id });
      res.status(200).json({ status: status.status });
    } catch (err) {
      res.json({err:err.message})
    }
  },


  //GET coupon page 
  adminCoupon_get: async (req, res) => {
    try {
      const coupons = await Coupons.find({});
      res.render("adminCoupon", { coupons });
    } catch (err) {
      res.json({err:err.message})
    }
  },



  // GET create coupon page 
  adminCreateCoupon_get: async (req, res) => {
    try {
      res.render("adminCreateCoupon");
    } catch (err) {
     res.json({err:err.message})
    }
  },


  // POST create new coupon 
  adminCreateCoupon_post: async (req, res) => {
    try {
      const coupon = new Coupons({
        couponName: req.body.couponName,
        couponCode: req.body.couponCode,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        shipping: req.body.shipping,
        quantity: req.body.quantity,
        discountRate: req.body.DiscountRate,
      });

      const result = await coupon.save();
    } catch (err) {
      res.json({err:err.message})
    }

    res.redirect("/admin/coupons");
  },



  // POST disabling products 
  disableProduct: async (req, res) => {
    const product = await Products.updateOne({ _id: req.body.id }, [
      { $set: { disable: { $not: "$disable" } } },
    ]);
    const productUpdate = await Products.findOne({ _id: req.body.id });
    res.status(200).json({ data: productUpdate.disable });
  },




  // POST editing the product the details
  editProduct: async (req, res) => {
    const { id, name, color, stock, size, category, price } = req.body;
    try {
      const updateProduct = await Products.updateMany(
        { _id: id },
        {
          $set: {
            productName: name,
            productColor: color,
            productInStock: stock,
            productSize: size,
            productCategory: category,
            productPrize: price,
          },
        },
        { upsert: true }
      );
      const product = await Products.findOne({ _id: id });
      res.status(200).json({
        data: {
          name: product.productName,
          color: product.productColor,
          availablity: product.productInStock,
          size: product.productSize,
          category: product.productCategory,
          price: product.productPrize,
        },
      });
    } catch (err) {
      res.status(400).json({ error: err.value, path: err.path });
    }
  },



  // POST disabling the coupon 
  disableCoupon: async (req, res) => {
    const { id } = req.body;
    try {
      const coupon = await Coupons.updateOne(
        { _id: id },
        [{ $set: { status: { $not: "$status" } } }],
        { upsert: true }
      );
      const couponStatus = await Coupons.findOne({ _id: id });
      res.status(200).json({ data: couponStatus.status });
    } catch (err) {
      res.json({err:err.message})
    }
  },
};
