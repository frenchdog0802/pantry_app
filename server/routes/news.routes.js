import express from "express";
import newsCtrl from "../controllers/news.controller.js";
import authCtrl from "../controllers/auth.controller.js";
const router = express.Router();
router.route("/api/news").post(newsCtrl.create);
router.route("/api/news").get(newsCtrl.list);

router
    .route("/api/news/:newsId")
    .get(authCtrl.requireSignin, newsCtrl.read)
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, newsCtrl.update)
    .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, newsCtrl.remove);



export default router;
