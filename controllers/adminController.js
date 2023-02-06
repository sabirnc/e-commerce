const category = require("../models/category");
const Products = require("../models/adminProduct");
const Category = require("../models/category");
const Coupons = require("../models/coupon");
const User = require("../models/user")
const Order = require("../models/order")
const jwt = require("jsonwebtoken");
const randomId = require("random-id");
const len = 10;
const pattern = "aA0";
const adminUserName = "sabir";
const adminPassword = "1234";

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
  console.log(err);
  return errors;
};

module.exports = {
  admin_signIn: (req, res) => {
    res.render("adminsignup");
  },
  admin_post: (req, res) => {
    console.log("we will post");
    const { userName, password } = req.body;
    if (adminUserName === userName && adminPassword == password) {
      const payload = { user: adminUserName };
      const adminToken = jwt.sign(payload, process.env.secret, {expiresIn: "24h"});
      res.cookie("adminToken", adminToken);
      res.json({ message: "success" });
    } else {
      res.json({ message: "invalid user name or password" });
    }
  },
  logout: (req, res) => {
    res.cookie("adminToken", "", { maxAge: 1 });
    res.redirect("/admin/signin");
  },
  admin_get: (req, res) => {
    res.render("adminHome");
  },

  adminCategory_get: async (req, res) => {
    const result = await category.find({});
    res.render("adminCategory", { result });
  },

  adminAddCategory_get: (req, res) => {
    res.render("adminAddCategory");
  },

  adminAddCategory_post: async (req, res) => {
    console.log(req.body.categoryname);
    console.log(req.file);
    try {
      const categoryDetails = new category({
        name: req.body.categoryname,
        image: req.file.originalname,
      });

      const result = await categoryDetails.save();
      res.status(200).json({data:"ok"})
    } catch (e) {
      const error = handleErrors(e);
      res.status(400).json({ error });
    }
  },

  disableCategory: async (req , res) => {
     const disableCategory =  await Category.findOneAndUpdate({_id:req.body.id},[{$set:{disable:{$not:"$disable"}}}])
     res.status(200).json({data:disableCategory.disable})
  },

  adminProducts_get: async (req, res) => {
    const result = await Products.find({});
    res.render("adminProducts", { products: result });
  },

  adminProductDetails_get: (req, res) => {
    res.render("adminProductDetail");
  },

  adminAddProduct_get: async (req, res) => {
    const result = await category.find({});
    console.log(result);
    console.log("yes you are on there");
    res.render("adminAddProducts");
  },

  adminProductDetails_get: (req, res) => {
    res.render("adminProductDetail");
  },

  adminAddproducts_get: async (req, res) => {
    const result = await category.find({disable:false});
    console.log(result)
    res.render("adminAddProducts", { category: result });
  },

  adminAddproduct_post: async (req, res) => {
    try {
      const product = new Products({
        product_id: randomId(len, pattern),
        productName: req.body.productName,
        productColor: req.body.productColor,
        productInStock: req.body.productInStock,
        productPrize: req.body.productPrize,
        productSize: req.body.productSize,
        productImage: req.files.map((file) => file.originalname),
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

  adminOrders_get: async (req, res) => {

    try{
      const orders = await Order.find({}).populate("user").populate("products")
      res.render("adminOrders" , {orders});
    }
    catch(err){
      console.log(err)
    }
   
  },

  adminOrderDetails_get: async (req, res) => {
    const orderDetails = await Order.findById(req.params.id).populate("user").populate("products.product")
    console.log(orderDetails)
    res.render("adminOrderDetails" , {orderDetails});
  },

  adminCustomers_get: async (req, res) => {

    try{
      const users = await User.find({})
      res.render("adminCustomers" ,{users});
    }
    catch(err){
      console.log(err)
    }

    
  },

  customer_status: async (req , res) => {
    let {id, status} = req.body
    console.log(typeof status)

    try{
      const updateStatus = await User.findOneAndUpdate({_id:id} , {$set:{status:!status}} , {new:true})
      console.log(updateStatus)
      res.json({message:"success"})
    }
    catch(err){
      console.log(err)
    }
    
    
  },

  adminCoupon_get: async (req, res) => {
    try {
      const coupons = await Coupons.find({});
      res.render("adminCoupon", { coupons });
    } catch (err) {
      console.log(err);
    }
  },

  adminCreateCoupon_get: async (req, res) => {
    try {
      res.render("adminCreateCoupon");
    } catch (err) {
      console.log(err);
    }
  },

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

      const result = await coupon.save((err) => {
        if (err) {
          console.log("this error occured in saving coupon document" + err);
        }
      });
    } catch (err) {
      console.log(err);
    }

    res.redirect("/admin/coupons");
  },

  adminProduct_delete: (req, res) => {
    Products.findOneAndDelete({ product_id: req.params.id }, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("document document deleted id :" + req.params.id);
        res.json({ redirect: "/admin/products" });
      }
    });
  },
  editProduct: async (req, res) => {
    const {id , name, color , stock , size , category , price} = req.body
    console.log(req.body)
    try{
     const updateProduct = await Products.updateMany({_id:id} ,{$set:{productName:name , productColor:color , productInStock:stock, productSize:size, productCategory:category , productPrize:price}}, {upsert:true})
     const product = await Products.findOne({_id:id})
     console.log(product)
     console.log("we will do this")
      res.status(200).json({
        data:{
        name:product.productName,
        color:product.productColor,
        availablity:product.productInStock,
        size:product.productSize,
        category:product.productCategory,
        price:product.productPrize
        }

      })
     }
    catch(err){
      console.log(err)
      res.status(400).json({error:err.value , path:err.path})
    }
  

  }
};
