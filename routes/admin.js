var express = require('express');
var router = express.Router();
const adminController = require("../controllers/adminController")
const {adminAuth} = require("../middleware/jwt")
const { Upload, multipleUploadErrorHandling} = require("../middleware/multer")


/* GET home page. */
router.get('/',adminAuth, adminController.admin_get)
router.post("/signin" , adminController.admin_post)
router.get("/signin" , adminController.admin_signIn)
router.get("/category",adminAuth, adminController.adminCategory_get)
router.get("/addcategory" ,adminAuth, adminController.adminAddCategory_get)
router.post("/addcategory" ,adminAuth, adminController.adminAddCategory_post)
router.get("/products" ,adminAuth, adminController.adminProducts_get)
router.get("/add-product" ,adminAuth, adminController.adminAddproducts_get)
router.post("/add-product" ,adminAuth, multipleUploadErrorHandling, adminController.adminAddproduct_post)
router.get("/orders",adminAuth, adminController.adminOrders_get)
router.get("/order-details/:id" ,adminAuth, adminController.adminOrderDetails_get)
router.get("/customers" ,adminAuth, adminController.adminCustomers_get)
router.post("/customers", adminAuth , adminController.customer_status)
router.get("/coupons",adminAuth, adminController.adminCoupon_get)
router.get("/create-coupons",adminAuth, adminController.adminCreateCoupon_get)
router.post("/create-coupons" ,adminAuth, adminController.adminCreateCoupon_post)
router.post("/disable-category", adminAuth, adminController.disableCategory)
router.post("/edit-product" , adminAuth , adminController.editProduct)
router.post("/disable-product",adminAuth, adminController.disableProduct)
router.post("/order-status" , adminAuth , adminController.orderStatus)
router.post("/disable-coupon", adminAuth , adminController.disableCoupon)
router.get("/add-banner",adminAuth , adminController.adminBanner)
router.post("/add-banner" , adminAuth, Upload.single("files") , adminController.uploadBanner)
router.get("/banner" , adminAuth , adminController.banner)
router.post("/disable-banner" , adminAuth, adminController.disableBanner)
router.get("/logout", adminController.logout)

module.exports = router;
