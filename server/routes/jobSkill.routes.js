import express from "express";
import jobSkillCtrl from "../controllers/jobSkill.controller.js";
import authCtrl from "../controllers/auth.controller.js";  // If authentication is required
const router = express.Router();

// Route: Add a new jobSkill
router.route("/api/jobSkill").post(jobSkillCtrl.create);

// Route: Get all jobSkills
router.route("/api/jobSkill").get(jobSkillCtrl.list);

// Route: Get, update, delete a specific jobSkill by ID
router
    .route("/api/jobSkill/:jobSkillId")
    .get(jobSkillCtrl.read)  // Get a specific jobSkill
    .put(jobSkillCtrl.update)  // Update a specific jobSkill
    .delete(jobSkillCtrl.remove);  // Delete a specific jobSkill

// Param: Handle 'jobSkillId' parameter
router.param("jobSkillId", jobSkillCtrl.jobSkillByID);
router.route("/api/jobSkill").delete(jobSkillCtrl.removeAll);

export default router;