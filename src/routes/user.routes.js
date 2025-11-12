import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createNote, deleteNote, getCurrentUser, getNote, loginUser, logOutUser, registerUser,  updateNoteDiscription, updateNoteTitle } from "../controllers/user.controller.js";
import { sendOtpController } from "../controllers/otp.controller.js";




const router = Router();

router.route("/send-otp").post(sendOtpController);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/logout").post(verifyJWT,logOutUser);
router.route("/create-note").post(verifyJWT,createNote);
router.route("/update-note-discription").patch(verifyJWT,updateNoteDiscription);
router.route("/update-note-title").patch(verifyJWT,updateNoteTitle);
router.route("/delete-note").delete(verifyJWT,deleteNote);
router.route("/get-note").get(verifyJWT,getNote);

export default router;