import express from "express";
import cloudinaryCtrl from "../services/cloudinary.service.js";
import auth from "../services/auth.service.js";
const router = express.Router();

router.post('/image', auth.requireSignin, cloudinaryCtrl.uploadImage);

router.delete('/image/:public_id', auth.requireSignin, cloudinaryCtrl.deleteImage);


export default router;