const multer = require("multer");
const fs = require("fs");
const path = require("path");

// multer using for multiple upload
const storages = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/product";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname);
  },
});

// storages.on("multer.onError" , function (err ,niext){

// })

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multipleUpload = multer({
  storage: storages,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// multer using for single upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images");
      console.log(file)
    },
    filename: (req, file, cb) => {
      console.log(file);
      cb(null, file.originalname);
    },
});


var Upload = multer({ storage });
const singleUploadErrorHandling = (req , res , next) => {
  try{
    Upload.single("file")(req , res , function(err){
      if(err){
        console.log("hello multer")
        return res.status(400).json({error:"please upload a image"})
      }
      next()
     
    })
  }catch(err){
    res.status(400).json({errors:"an error occured while uploading the image"})
  }
}


module.exports = {
    storages: multipleUpload,
    singleUploadErrorHandling
}