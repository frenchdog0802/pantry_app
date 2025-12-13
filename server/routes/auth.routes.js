import express from "express";
import authCtrl from "../controllers/auth.controller.js";
const router = express.Router();
router.route("/signup").post(authCtrl.signup);
router.route("/signin").post(authCtrl.signin);
router.route("/signout").get(authCtrl.signout);
router.route("/google-login").post(authCtrl.googleLogin);

export default router;
