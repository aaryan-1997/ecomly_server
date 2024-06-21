const multer = require('multer');

const ALLOWED_EXTENSIONS = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const filename = file.originalname.replace(/\s/g, '_');
        const extension = ALLOWED_EXTENSIONS[file.mimetype];
        cb(null, `${filename}-${Date.now()}.${extension}`);
    }
});

exports.upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1025 * 5 // 5mb
    },
    fileFilter: (_, file, cb) => {
        const isValid = ALLOWED_EXTENSIONS[file.mimetype];
        if (!isValid) {
            return cb(new Error(`Invalid image type\n${file.mimetype} is not allowed`));
        }
        return cb(null, true);
    }
});
