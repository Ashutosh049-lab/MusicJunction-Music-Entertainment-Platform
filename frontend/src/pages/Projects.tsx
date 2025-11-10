import { useState, useEffect } from 'react';
import { Plus, Folder, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../lib/axios';
import { EmptyState, LoadingSpinner } from '../components/ui';
import { toast } from 'sonner';
import { formatTimeAgo } from '../lib/utils';

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await apiClient.get('/projects');
      setProjects(data.projects || data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      const { data } = await apiClient.post('/projects', newProject);
      setProjects([data.project || data, ...projects]);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Collaborate with other musicians</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          <Plus className="h-5 w-5" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-card border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(project.createdAt)}
                    </p>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {project.collaborators?.length || 0} members
                  </span>
                  <span>{project.files?.length || 0} files</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="Folder"
          title="No projects yet"
          description="Create a project to collaborate with other musicians"
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-50 bg-card border rounded-lg p-6 max-w-md w-full      bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 hover:bg-dark-200 text-foreground placeholder:text-foreground/70 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="My Awesome Project"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-300 hover:bg-dark-200 text-foreground placeholder:text-foreground/70 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Describe your project..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-input rounded-lg hover:bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
