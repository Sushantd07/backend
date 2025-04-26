import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {   // i) req - json data, ii) file- multer
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)   // Not Good Because User Can make Multiple file with same name (Overwite)
    }
  })
  
export const upload = multer({ storage:storage})