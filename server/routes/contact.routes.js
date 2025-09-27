import express from "express";
import contactCtrl from "../controllers/contact.controller.js";
import authCtrl from "../controllers/auth.controller.js";  // If authentication is required
const router = express.Router();

// Route: Add a new contact
router.route("/api/contacts").post(contactCtrl.create);

// Route: Get all contacts
router.route("/api/contacts").get(contactCtrl.list);

// Route: Get, update, delete a specific contact by ID
router
    .route("/api/contacts/:contactId")
    .get(contactCtrl.read)  // Get a specific contact
    .put(contactCtrl.update)  // Update a specific contact
    .delete(contactCtrl.remove);  // Delete a specific contact

// Param: Handle 'contactId' parameter
router.param("contactId", contactCtrl.contactByID);
router.route("/api/contacts").delete(contactCtrl.removeAll);

export default router;