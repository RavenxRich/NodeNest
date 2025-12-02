import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { useTheme } from 'next-themes';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import RadialCanvas from '../components/RadialCanvas';
import AddNodeModal from '../components/AddNodeModal';
import NodeDetailsSidebar from '../components/NodeDetailsSidebar';
import { toast } from 'sonner';
import { Plus, Settings, BarChart3, Moon, Sun, Search, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { storageMode, tools, loadTools, trackClick, updateTool } = useStorage();
  const { theme, setTheme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState([]);

  useEffect(() => {
    if (!storageMode) {
      navigate('/');
    }
  }, [storageMode, navigate]);

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredTools(
        tools.filter(t => 
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      );
    } else {
      setFilteredTools(tools);
    }
  }, [searchQuery, tools]);

  const handleToolClick = async (tool) => {
    setSelectedTool(tool);
    // Track click and open URL
    await trackClick(tool.id);
    window.open(tool.url, '_blank');
  };

  const handleToolMove = async (toolId, newPosition) => {
    // Convert screen position back to angle and radius
    const centerX = window.innerWidth / 2;
    const centerY = (window.innerHeight - 80) / 2;
    const dx = newPosition.x - centerX;
    const dy = newPosition.y - centerY;
    const angle = Math.atan2(dy, dx);
    const radius = Math.sqrt(dx * dx + dy * dy);

    await updateTool(toolId, {
      position: { angle, radius }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('storageMode');
    localStorage.removeItem('userId');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" data-testid="dashboard-page">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-900" />
      <div className="absolute inset-0 radial-bg" />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-20 glass border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold gradient-text">NodeNest</h1>
            <div className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              data-testid="add-node-btn"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Tool
            </Button>
            <Button
              data-testid="stats-btn"
              size="sm"
              variant="ghost"
              onClick={() => navigate('/stats')}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              data-testid="settings-btn"
              size="sm"
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              data-testid="theme-toggle-btn"
              size="sm"
              variant="ghost"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              data-testid="logout-btn"
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Canvas */}
      <div className="relative h-[calc(100vh-80px)]">
        {filteredTools.length > 0 ? (
          <RadialCanvas
            tools={filteredTools}
            onToolClick={handleToolClick}
            onToolMove={handleToolMove}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
              <Plus className="w-12 h-12 text-violet-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No tools yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery ? 'No tools match your search.' : 'Start by adding your first AI tool to the collection!'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Tool
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Node Modal */}
      <AddNodeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Node Details Sidebar */}
      <NodeDetailsSidebar
        tool={selectedTool}
        onClose={() => setSelectedTool(null)}
      />
    </div>
  );
};

export default Dashboard;
