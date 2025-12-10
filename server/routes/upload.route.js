import express from "express";
import cloudinaryCtrl from "../controllers/cloudinary.controller.js";
import auth from "../controllers/auth.controller.js";
const router = express.Router();

router.post('/image', auth.requireSignin, cloudinaryCtrl.uploadImage);


export default router;