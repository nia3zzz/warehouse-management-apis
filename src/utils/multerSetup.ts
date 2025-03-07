import { Request } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join("../../tmp/my-uploads");

// ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//multer setup & rename file
const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req: Request, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });
export default upload;
