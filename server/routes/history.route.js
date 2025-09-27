import express from "express";
import historyCtrl from "../controllers/history.controller.js";
const router = express.Router();
router.route("/api/history").get(historyCtrl.getAllHistory);
// router.route("/api/history/:id").get(historyCtrl.getHistoryById);
// router.route("/api/history").post(historyCtrl.createHistory);
// router.route("/api/history/:id").put(historyCtrl.updateHistory);
// router.route("/api/history/:id").delete(historyCtrl.deleteHistory);
export default router;
