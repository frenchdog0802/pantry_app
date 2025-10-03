import express from "express";
import folderCtrl from "../controllers/folder.controller.js";

const router = express.Router();

router.get('/', folderCtrl.getAllFolders);
router.get('/:id', folderCtrl.getFolderById);
router.post('/', folderCtrl.createFolder);
router.put('/:id', folderCtrl.updateFolder);
router.delete('/:id', folderCtrl.deleteFolder);

export default router;