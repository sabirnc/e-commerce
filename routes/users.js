var express = require('express');
var router = express.Router();
const userController = require("../controllers/userController");
const jwt = require('../middleware/jwt');
const {jwt_func , checkUser , ifLoged} = require("../middleware/jwt")

/* GET users listing. */
router.get('/', checkUser ,userController.home_get)
router.get("/login", ifLoged, userController.login_get)
router.post("/login" , userController.login)
router.get("/signup" ,ifLoged, userController.signup_get)
router.post("/signup" , userController.signup)
router.get("/shop" ,checkUser, jwt_func,userController.shop_get)
router.get("/blog" ,checkUser, jwt_func,userController.blog_get)
router.get("/about" , checkUser, jwt_func,userController.about_get)
router.get("/wishlist" ,checkUser,jwt_func, userController.wishList_get)
router.get("/cart" ,checkUser, jwt_func, userController.cart_get)
router.post("/cart", checkUser, jwt_func, userController.addToCart)
router.get("/checkout" ,checkUser ,jwt_func, userController.checkOut_get)
router.get("/product-detail/:id",checkUser, jwt_func, userController.productDetail_get)
router.delete("/delete-item" ,checkUser, userController.deleteItem)
router.post("/place-order" , checkUser , jwt_func , userController.placeOrder)
router.get("/my-account" , checkUser , jwt_func , userController.userDashboard)
router.get("/sign-out", checkUser , jwt_func , userController.signOut)
router.post("/apply-coupon" , checkUser, jwt_func , userController.applyCoupon)
router.get("/filer-product" ,checkUser , jwt_func , userController.filterProduct)





module.exports = router;
