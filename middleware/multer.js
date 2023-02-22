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
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});


var Upload = multer({ storage });
const singleUploadErrorHandling = async (req , res , next) => {
  try{
    Upload.single("file")(req , res , function(err){
      if(err){
        return res.status(400).json({error:"please upload a image"})
      }
      next()
     
    })
  }catch(err){
    res.status(400).json({errors:"an error occured while uploading the image"})
  }
}

const multipleUploadErrorHandling =  async (req , res , next) => {
  try{
    multipleUpload.array("file" , 4)(req , res ,function(err){
      if(err instanceof multer.MulterError){
        return res.status(400).json({errors:"maximum limit is four"})
      }
      next()
    })
  }
  catch{

  }
}


module.exports = {
    multipleUploadErrorHandling,
    singleUploadErrorHandling
}