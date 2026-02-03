import express from "express";
import authCtrl from "../services/auth.service.js";
const router = express.Router();
router.route("/signup").post(authCtrl.signup);
router.route("/signin").post(authCtrl.signin);
router.route("/signout").get(authCtrl.signout);
router.route("/google-login").post(authCtrl.googleLogin);
router.route("/auth0").post(authCtrl.auth0Login);

export default router;
