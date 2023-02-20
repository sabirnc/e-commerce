const jwt = require("jsonwebtoken");
const User = require("../models/user");
module.exports = {
  jwt_func: (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      res.redirect("/login");
    } else {
      jwt.verify(token, process.env.secret, (err, decodedToken) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log(decodedToken.id); 
        }
      });
    }
    next();
  },

  checkUser: (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
      jwt.verify(token, process.env.secret, async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          if(err.message.includes("jwt expired")){
            res.cookie("token" ,"" , {maxAge:1})
          }
        } else {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
          req.userId = decodedToken.id;
          next();
        }
      });
    } else {
      res.locals.user = null;
      next();
    }
  },
  adminAuth: (req, res, next) => {
    const token = req.cookies.adminToken;
    if (token) {
      jwt.verify(token, process.env.secret, async (err, decode) => {
        if (err) {
          console.log(err.message);
        }
      });
    } else {
      res.redirect("/admin/signin");
    }

    next();
  },

  ifLoged: (req, res, next) => {
    const token = req.cookies.token;
    console.log("check a user is loged in  ")
    if (token) {
      console.log("logged")
      jwt.verify(token, process.env.secret, async (err, decode) => {
        if (err) {
          console.log(err.message + "Logged");
        }
        const user = await User.findOne({_id:decode.id})
        if (req.url == "/login" && user.status) {
          res.redirect("/");
        }
        if(req.url == "/signup"){
          res.redirect("/")
        }
      });
    }else{
      next()
       // res.redirect("/login")
    }
  },

  checkStatus:  (req, res , next) => {
    const token = req.cookies.token
    if(token){
      jwt.verify(token , process.env.secret ,async (err,decode) => {
        if(err){
          next()
          console.log(err.message)
          res.redirect("/login")
        }else{
          let user = await User.findOne({_id:decode.id})
          if(!user.status){
            console.log("user status is false")
             res.redirect("/login")
          }else{
            next()
          }
        }
      })
    }else{
      next()
    }
    
  }
};
