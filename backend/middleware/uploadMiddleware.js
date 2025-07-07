import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsFolder = 'uploads';
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG files are allowed.'), false);
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
})
export default upload;