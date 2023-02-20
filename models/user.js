const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "fullname is required"],
  },
  userName: {
    type: String,
    required: [true, "username is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required "],
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "minimum password length is 6 characters"],
  },
  phoneNumber: {
    type: Number,
    required: [true, "please enter your contact number"],
    unique: true,
    validate: {
      validator: function(value) {
        return value.toString().length == 10;
      },
      message: 'number is not valid '
    }
  },
  status:{
    type:Boolean,
    default:true
  },
  couponApplied:{
    type:Boolean,
    default:false
  },
  coupons:{
    type:String,
    default:""
  },
  created: {
    type: Date,
  },
},{timestamps:true});

userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next()
 
});

userSchema.statics.login = async function (userName, password) {
  const user = await this.findOne({ userName });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    console.log(user.status)
    if (auth) {
      if(user.status){
        return user;
      }
      throw Error("admin blocked your account")
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect user name");
};

const User = mongoose.model("user", userSchema);
module.exports = User;
