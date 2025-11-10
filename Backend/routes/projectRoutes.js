
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const projectController = require("../controllers/projectController");

// Create new project
router.post("/", auth, projectController.createProject);

// Get all my projects
router.get("/", auth, projectController.getMyProjects);

// Invite collaborator
router.post("/:id/invite", auth, projectController.inviteCollaborator);

// Remove collaborator
router.delete("/:id/collaborators/:userId", auth, projectController.removeCollaborator);

module.exports = router;
