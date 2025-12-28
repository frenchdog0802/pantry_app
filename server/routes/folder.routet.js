import express from "express";
import folderCtrl from "../services/folder.service.js";
import auth from "../services/auth.service.js";

const router = express.Router();

router.get('/', auth.requireSignin, folderCtrl.getAllFolders);
router.get('/:id', auth.requireSignin, folderCtrl.getFolderById);
router.post('/', auth.requireSignin, folderCtrl.createFolder);
router.put('/:id', auth.requireSignin, folderCtrl.updateFolder);
router.delete('/:id', auth.requireSignin, folderCtrl.deleteFolder);

export default router;