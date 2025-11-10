
// controllers/projectController.js
const Project = require("../models/Project");
const User = require("../models/User");

// ✅ Create new project (only logged-in users)
exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.create({
      title,
      description,
      owner: req.user.id,
      collaborators: [],
    });

    res.status(201).json({
      message: "🎶 Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all projects for current user
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { "collaborators.user": userId },
      ],
    })
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Invite collaborator to project (Owner only)
exports.inviteCollaborator = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { id } = req.params; // project ID

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can invite collaborators" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent duplicate collaborators
    const alreadyAdded = project.collaborators.some(
      (c) => c.user.toString() === user._id.toString()
    );
    if (alreadyAdded)
      return res.status(400).json({ message: "User already added as collaborator" });

    project.collaborators.push({ user: user._id, role });
    await project.save();

    res.status(200).json({
      message: `✅ ${user.name} invited as ${role}`,
      project,
    });
  } catch (error) {
    console.error("Error inviting collaborator:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Remove collaborator (Owner only)
exports.removeCollaborator = async (req, res) => {
  try {
    const { id, userId } = req.params; // projectId, collaborator userId

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can remove collaborators" });

    project.collaborators = project.collaborators.filter(
      (c) => c.user.toString() !== userId
    );
    await project.save();

    res.status(200).json({
      message: "🗑️ Collaborator removed successfully",
      project,
    });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    res.status(500).json({ message: "Server error" });
  }
};
