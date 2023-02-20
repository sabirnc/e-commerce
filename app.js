require("dotenv").config({path:".env"})
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require("body-parser")
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
const mongoose = require("mongoose");
const jwt = require("./middleware/jwt")
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/' , usersRouter);
app.use('/admin', adminRouter);

mongoose.connect(process.env.uri , 
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then( () => {
    console.log("connected to db successfullly")
})
.catch((err) => console.log(err))



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error")
  console.log(err)
  // console.log(err)
});


app.listen(5000,  () => {
  console.log("hello server started")
})

module.exports = app;
