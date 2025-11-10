
// models/Project.js
const mongoose = require("mongoose");

const fileVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number },
  mimeType: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  notes: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { 
    type: String, 
    enum: ['created', 'updated', 'commented', 'file_added', 'file_updated', 'member_added', 'member_removed', 'status_changed'],
    required: true 
  },
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional context
  timestamp: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  // Basic Information
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  category: { 
    type: String, 
    enum: ['song', 'album', 'ep', 'remix', 'cover', 'podcast', 'soundtrack', 'other'],
    default: 'song'
  },
  genre: { type: String, trim: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  
  // Ownership & Collaboration
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { 
        type: String, 
        enum: ["admin", "editor", "contributor", "viewer"], 
        default: "viewer" 
      },
      permissions: {
        canEdit: { type: Boolean, default: false },
        canUpload: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false },
        canInvite: { type: Boolean, default: false },
        canComment: { type: Boolean, default: true }
      },
      invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      invitedAt: { type: Date, default: Date.now },
      acceptedAt: { type: Date },
      status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'accepted' }
    }
  ],
  
  // Project Status
  status: { 
    type: String, 
    enum: ['draft', 'in-progress', 'review', 'completed', 'archived', 'cancelled'],
    default: 'draft'
  },
  visibility: { 
    type: String, 
    enum: ['private', 'collaborators', 'public'], 
    default: 'private' 
  },
  
  // File Management
  files: [
    {
      name: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['audio', 'midi', 'stems', 'notes', 'lyrics', 'artwork', 'other'],
        required: true
      },
      currentVersion: { type: Number, default: 1 },
      versions: [fileVersionSchema],
      description: { type: String },
      isLocked: { type: Boolean, default: false }, // Prevent changes
      lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  
  // Metadata
  coverImage: { type: String },
  tempo: { type: Number }, // BPM
  key: { type: String }, // Musical key
  timeSignature: { type: String }, // e.g., "4/4"
  duration: { type: Number }, // in seconds
  
  // Milestones & Deadlines
  milestones: [
    {
      title: { type: String, required: true },
      description: { type: String },
      dueDate: { type: Date },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }
  ],
  targetReleaseDate: { type: Date },
  
  // Engagement & Stats
  viewCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  
  // Activity Log
  activities: [activitySchema],
  lastActivityAt: { type: Date, default: Date.now },
  
  // Output
  finalTrack: { type: mongoose.Schema.Types.ObjectId, ref: "Music" }, // Link to published music
  relatedTracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
  
  // Settings
  settings: {
    allowComments: { type: Boolean, default: true },
    allowDownloads: { type: Boolean, default: false },
    versioningEnabled: { type: Boolean, default: true },
    notifyOnUpdates: { type: Boolean, default: true }
  },
  
  // Archival
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total collaborators count
projectSchema.virtual('collaboratorsCount').get(function() {
  return this.collaborators ? this.collaborators.length : 0;
});

// Virtual for accepted collaborators
projectSchema.virtual('activeCollaborators').get(function() {
  return this.collaborators ? this.collaborators.filter(c => c.status === 'accepted') : [];
});

// Virtual for total files
projectSchema.virtual('totalFiles').get(function() {
  return this.files ? this.files.length : 0;
});

// Virtual for completion percentage (based on milestones)
projectSchema.virtual('completionPercentage').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completed = this.milestones.filter(m => m.completed).length;
  return Math.round((completed / this.milestones.length) * 100);
});

// Indexes for Performance
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ 'collaborators.user': 1, status: 1 });
projectSchema.index({ status: 1, visibility: 1 });
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });
projectSchema.index({ genre: 1 });
projectSchema.index({ lastActivityAt: -1 }); // Recently active projects
projectSchema.index({ targetReleaseDate: 1 }); // Upcoming releases
projectSchema.index({ isArchived: 1, createdAt: -1 });

// Method to add activity
projectSchema.methods.addActivity = async function(user, action, description, metadata = {}) {
  this.activities.push({
    user,
    action,
    description,
    metadata,
    timestamp: Date.now()
  });
  
  // Keep only last 100 activities
  if (this.activities.length > 100) {
    this.activities = this.activities.slice(-100);
  }
  
  this.lastActivityAt = Date.now();
  return this.save();
};

// Method to add collaborator
projectSchema.methods.addCollaborator = async function(userId, role = 'viewer', invitedBy) {
  // Check if user is already a collaborator
  const exists = this.collaborators.find(c => c.user.toString() === userId.toString());
  if (exists) {
    throw new Error('User is already a collaborator');
  }
  
  const permissions = {
    canEdit: ['admin', 'editor'].includes(role),
    canUpload: ['admin', 'editor', 'contributor'].includes(role),
    canDelete: role === 'admin',
    canInvite: role === 'admin',
    canComment: true
  };
  
  this.collaborators.push({
    user: userId,
    role,
    permissions,
    invitedBy,
    invitedAt: Date.now(),
    status: 'pending'
  });
  
  return this.save();
};

// Method to add file version
projectSchema.methods.addFileVersion = async function(fileIndex, fileUrl, fileName, fileSize, mimeType, uploadedBy, notes) {
  if (!this.files[fileIndex]) {
    throw new Error('File not found');
  }
  
  const newVersion = this.files[fileIndex].currentVersion + 1;
  
  this.files[fileIndex].versions.push({
    version: newVersion,
    fileUrl,
    fileName,
    fileSize,
    mimeType,
    uploadedBy,
    notes,
    createdAt: Date.now()
  });
  
  this.files[fileIndex].currentVersion = newVersion;
  this.files[fileIndex].updatedAt = Date.now();
  
  return this.save();
};

// Pre-save hook to update lastActivityAt
projectSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivityAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
