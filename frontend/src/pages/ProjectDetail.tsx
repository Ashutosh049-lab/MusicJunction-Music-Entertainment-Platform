import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Folder, UserPlus, Users, FileAudio, Calendar, 
  Trash2, X
} from 'lucide-react';
import axios from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { toast } from 'sonner';

interface Collaborator {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: string;
  _id?: string;
}

interface Project {
  _id: string;
  title: string;
  description?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  collaborators: Collaborator[];
  files?: Array<{
    _id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      // Get all projects and find the one with matching ID
      const response = await axios.get('/projects');
      
      if (Array.isArray(response.data)) {
        const foundProject = response.data.find((p: Project) => p._id === id);
        if (foundProject) {
          setProject(foundProject);
        } else {
          toast.error('Project not found');
        }
      } else if (response.data.success) {
        const foundProject = response.data.data.find((p: Project) => p._id === id);
        if (foundProject) {
          setProject(foundProject);
        } else {
          toast.error('Project not found');
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email');
      return;
    }

    try {
      const response = await axios.post(`/projects/${id}/invite`, {
        email: inviteEmail,
        role: inviteRole
      });
      
      if (response.data.message) {
        toast.success(response.data.message);
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('editor');
        fetchProject();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to invite collaborator');
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      const response = await axios.delete(`/projects/${id}/collaborators/${userId}`);
      
      if (response.data.message) {
        toast.success(response.data.message);
        fetchProject();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove collaborator');
    }
  };

  const isOwner = user?._id === project?.owner._id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <EmptyState
          icon="Folder"
          title="Project not found"
          description="This project doesn't exist or you don't have access to it"
          action={{ label: 'Go to Projects', onClick: () => navigate('/projects') }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Project Header */}
      <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Folder className="w-8 h-8 text-primary-500" />
              <h1 className="text-4xl font-bold">{project.title}</h1>
            </div>
            {project.description && (
              <p className="text-gray-400 mb-4">{project.description}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Owner: {project.owner.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{project.collaborators.length} collaborators</span>
              </div>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Invite Collaborator
            </button>
          )}
        </div>
      </div>

      {/* Collaborators Section */}
      <div className="bg-dark-200 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-500" />
          Collaborators
        </h2>

        {project.collaborators.length === 0 ? (
          <EmptyState
            icon="Users"
            title="No collaborators yet"
            description={isOwner ? "Invite team members to collaborate on this project" : "Only the owner can add collaborators"}
            action={
              isOwner
                ? { label: 'Invite Collaborator', onClick: () => setShowInviteModal(true) }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.collaborators.map((collab) => (
              <motion.div
                key={collab.user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-300 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                    {collab.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold">{collab.user.name}</h4>
                    <p className="text-sm text-gray-400">{collab.user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                      {collab.role}
                    </span>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleRemoveCollaborator(collab.user._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Files Section */}
      <div className="bg-dark-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileAudio className="w-6 h-6 text-primary-500" />
          Project Files
        </h2>

        {(!project.files || project.files.length === 0) ? (
          <EmptyState
            icon="Music"
            title="No files yet"
            description="Project files and audio tracks will appear here"
          />
        ) : (
          <div className="space-y-3">
            {project.files.map((file, index) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-dark-300 rounded-lg p-4 flex items-center justify-between hover:bg-dark-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileAudio className="w-8 h-8 text-primary-500" />
                  <div>
                    <h4 className="font-semibold">{file.name}</h4>
                    <p className="text-sm text-gray-400">
                      {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB • 
                      Uploaded {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.open(file.url, '_blank')}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  Download
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Collaborator Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-100 rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Invite Collaborator</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRole('editor');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full bg-dark-200 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-dark-200 rounded-lg px-4 py-3"
                >
                  <option value="viewer">Viewer - Can only view</option>
                  <option value="editor">Editor - Can edit and view</option>
                  <option value="admin">Admin - Full access</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRole('editor');
                }}
                className="flex-1 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteCollaborator}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Send Invite
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
