import multer from 'multer';
import fs from 'fs';

// SET STORAGE
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    // Create the directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const imageExtension = file.originalname.split('.').pop();
    const userId = req.user.userId;
    cb(null, `${userId}-${uniqueSuffix}.${imageExtension}`);
  },
});

var upload = multer({ storage: storage });

export default upload;
