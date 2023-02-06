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
          console.log(err.message);
          res.locals.user = null;
          next();
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
      jwt.verify(token, process.env.secret, async (err, decode) => {
        if (err) {
          console.log(err.message);
        }
      });

      if (req.url == "/login") {
         res.redirect("/");
      }
    }else{
       // res.redirect("/login")
      next()
    }
    next()
  },
};
