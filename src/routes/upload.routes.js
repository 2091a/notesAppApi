import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { multipleFileUplod, singleFileUplod } from "../controllers/fileUploder.controller.js";


const router = Router()


router.route("/upload-singleFile").post(upload.single("file"),singleFileUplod)
router.route("/upload-multipleFiles").post(upload.array("files", 5),multipleFileUplod)

export default router

