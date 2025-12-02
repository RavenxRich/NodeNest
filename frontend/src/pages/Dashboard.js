import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { useTheme } from 'next-themes';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import RadialCanvas from '../components/RadialCanvas';
import AddNodeModal from '../components/AddNodeModal';
import NodeDetailsSidebar from '../components/NodeDetailsSidebar';
import { toast } from 'sonner';
import { Plus, Settings, BarChart3, Moon, Sun, Search, LogOut, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { storageMode, tools, loadTools, trackClick, updateTool } = useStorage();
  const { theme, setTheme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem('nodenest_storage_mode');
    if (!mode) {
      navigate('/');
      return;
    }
    // If we have a mode but context doesn't, reload it
    if (!storageMode && mode) {
      window.location.reload();
    }
  }, [storageMode, navigate]);

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    let result = tools;
    
    // Filter by favorites if enabled
    if (showOnlyFavorites) {
      result = result.filter(t => t.favorite);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredTools(result);
  }, [searchQuery, tools, showOnlyFavorites]);

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

  const favoriteCount = tools.filter(t => t.favorite).length;

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
            {/* Favorites Toggle */}
            <Button
              data-testid="favorites-toggle-btn"
              size="sm"
              variant={showOnlyFavorites ? "default" : "ghost"}
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`gap-2 ${
                showOnlyFavorites ? 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-yellow-500 dark:hover:bg-yellow-600' : ''
              }`}
            >
              <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
              {favoriteCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {favoriteCount}
                </Badge>
              )}
            </Button>
            
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
          <>
            <RadialCanvas
              tools={filteredTools}
              onToolClick={handleToolClick}
              onToolMove={handleToolMove}
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
            />
            
            {/* Status indicator */}
            {showOnlyFavorites && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 glass px-6 py-3 rounded-full border border-yellow-500/30"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">Showing {favoriteCount} favorite{favoriteCount !== 1 ? 's' : ''}</span>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-6"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-8 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
              {showOnlyFavorites ? (
                <Star className="w-16 h-16 text-yellow-400" />
              ) : (
                <Plus className="w-16 h-16 text-violet-400" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-3 gradient-text">
              {showOnlyFavorites ? 'No Favorites Yet' : 'Welcome to NodeNest!'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg text-lg">
              {searchQuery 
                ? 'No tools match your search.' 
                : showOnlyFavorites
                ? 'Star your frequently used tools to see them here!'
                : 'Your personal AI tools bookmark manager. Add tools and watch them organize beautifully in the radial canvas!'}
            </p>
            {!searchQuery && !showOnlyFavorites && (
              <>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-8 py-6 text-lg mb-6"
                  data-testid="add-first-tool-btn"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Tool
                </Button>
                <div className="mt-8 p-6 glass rounded-2xl max-w-xl border border-white/10">
                  <p className="text-sm text-muted-foreground mb-3 font-semibold">Quick Start Examples:</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-left">
                      <span className="text-violet-400">•</span> ChatGPT / Claude
                    </div>
                    <div className="text-left">
                      <span className="text-pink-400">•</span> Midjourney / DALL-E
                    </div>
                    <div className="text-left">
                      <span className="text-cyan-400">•</span> GitHub Copilot
                    </div>
                    <div className="text-left">
                      <span className="text-orange-400">•</span> Zapier / Make
                    </div>
                  </div>
                </div>
              </>
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
