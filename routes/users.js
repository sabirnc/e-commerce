var express = require('express');
var router = express.Router();
const userController = require("../controllers/userController");
const jwt = require('../middleware/jwt');
const {jwt_func , checkUser , ifLoged, checkStatus , checkCart} = require("../middleware/jwt")
const {singleUploadErrorHandling} = require("../middleware/multer")
/* GET users listing. */
router.get('/',  checkUser ,userController.home_get)
router.get("/login",ifLoged, userController.login_get)
router.post("/login" , userController.login)
router.get("/signup" ,ifLoged, userController.signup_get)
router.post("/signup" , userController.signup)
router.get("/shop" , jwt_func, checkUser, checkStatus,userController.shop_get)
router.get("/blog" ,checkStatus,checkUser, jwt_func,userController.blog_get)
router.get("/about" , checkStatus,checkUser, jwt_func,userController.about_get)
router.get("/wishlist" ,checkStatus,checkUser,jwt_func, userController.wishList_get)
router.get("/cart" ,checkStatus,checkUser, jwt_func, userController.cart_get)
router.post("/cart", checkStatus, checkUser, jwt_func, userController.addToCart)
router.post("/increment" , checkStatus , checkUser , jwt_func , userController.increment)
router.post("/decrement", checkStatus , checkUser , jwt_func  , userController.decrement)
router.get("/checkout" ,checkStatus,checkUser ,jwt_func,checkCart, userController.checkOut_get)
router.post("/add-address", checkStatus , checkUser , jwt_func , userController.addAddress)
router.post("/edit-address" , checkStatus , checkStatus , jwt_func , userController.editAddress)
router.post("/delete-address", checkStatus , checkUser , jwt_func , userController.deleteAddress)
router.get("/product-detail/:id",checkStatus,checkUser, jwt_func, userController.productDetail_get)
router.delete("/delete-item" ,checkStatus,checkUser, userController.deleteItem)
router.post("/place-order" , checkStatus,checkUser , jwt_func , userController.placeOrder)
router.delete("/cancel-order",checkStatus, checkUser, jwt_func, userController.cancelOrder)
router.get("/my-account" , checkStatus,checkUser , jwt_func , userController.userDashboard)
router.get("/sign-out",checkStatus, checkUser , jwt_func , userController.signOut)
router.post("/apply-coupon" , checkStatus ,checkUser, jwt_func , userController.applyCoupon)
router.post("/remove-coupon" , checkStatus , checkUser , jwt_func , userController.removeCoupon)
router.get("/filer-product" ,checkStatus, checkUser , jwt_func , userController.filterProduct)
router.post("/addToWishlist" , checkStatus , checkUser , jwt_func , userController.addToWishlist)
router.post("/delete-product", checkStatus , checkUser , jwt_func , userController.deleteProduct)
router.get("/orders",checkStatus ,checkUser , jwt_func ,  userController.orders)
router.post("/create-paypal-order", checkStatus , checkUser , jwt_func ,userController.createPaypalOrder)
router.get("/get-orders", checkUser , checkStatus , jwt_func , userController.totalOrders)
router.post("/upload" , checkStatus , checkUser , jwt_func , userController.uploadProfilePhoto)
router.post("/update-profile" , checkStatus , checkUser , jwt_func , userController.updateProfile)
router.get("/invoice/:id" , checkStatus , checkUser , jwt_func , userController.invoice)





module.exports = router;
