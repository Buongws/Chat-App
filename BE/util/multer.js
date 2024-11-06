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
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

var upload = multer({ storage: storage });

export default upload;
