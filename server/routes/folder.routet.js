import express from "express";
import folderCtrl from "../controllers/folder.controller.js";
import { authenticateJWT } from "../controllers/auth.controller.js";

const router = express.Router();

router.get('/', authenticateJWT, folderCtrl.getAllFolders);
router.get('/:id', authenticateJWT, folderCtrl.getFolderById);
router.post('/', authenticateJWT, folderCtrl.createFolder);
router.put('/:id', authenticateJWT, folderCtrl.updateFolder);
router.delete('/:id', authenticateJWT, folderCtrl.deleteFolder);

export default router;