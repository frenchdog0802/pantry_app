import express from "express";
import userCtrl from "../controllers/user.controller.js";
import authCtrl from "../controllers/auth.controller.js";
const router = express.Router();
router.route("/").post(userCtrl.create);
router.route("/").get(userCtrl.list);

router
  .route("/:userId")
  .get(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);

router.param("userId", userCtrl.userByID);
router.route("/:userId").get(userCtrl.read);
router.route("/:userId").put(userCtrl.update);
router.route("/:userId").delete(userCtrl.remove);

export default router;
