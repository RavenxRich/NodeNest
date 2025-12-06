import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { useTheme } from 'next-themes';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Workflow,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const Systems = () => {
  const navigate = useNavigate();
  const { storageMode, systems, tools, loadSystems, createSystem, updateSystem, deleteSystem, logout } = useStorage();
  const { theme, setTheme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [systemName, setSystemName] = useState('');
  const [systemDescription, setSystemDescription] = useState('');
  const [steps, setSteps] = useState([{ order: 1, toolId: '', toolName: '', notes: '' }]);

  // Redirect if no storage mode
  useEffect(() => {
    if (!storageMode) {
      navigate('/');
    }
  }, [storageMode, navigate]);

  // Load systems on mount
  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  // Get tool by ID
  const getToolById = useCallback((toolId) => {
    return tools.find(t => t.id === toolId);
  }, [tools]);

  // Get tool name for display
  const getToolDisplayName = useCallback((toolId) => {
    if (!toolId) return '';
    const tool = getToolById(toolId);
    return tool ? tool.title : toolId;
  }, [getToolById]);

  const handleAddStep = useCallback(() => {
    setSteps([...steps, { order: steps.length + 1, toolId: '', toolName: '', notes: '' }]);
  }, [steps]);

  const handleRemoveStep = useCallback((index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    const reordered = newSteps.map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(reordered);
  }, [steps]);

  const handleStepChange = useCallback((index, field, value) => {
    const newSteps = [...steps];
    if (field === 'toolId') {
      const tool = getToolById(value);
      newSteps[index] = { 
        ...newSteps[index], 
        toolId: value,
        toolName: tool ? tool.title : ''
      };
    } else {
      newSteps[index] = { ...newSteps[index], [field]: value };
    }
    setSteps(newSteps);
  }, [steps, getToolById]);

  const handleMoveStep = useCallback((index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    const reordered = newSteps.map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(reordered);
  }, [steps]);

  const handleSave = useCallback(async () => {
    if (!systemName.trim()) {
      toast.error('Please enter a system name');
      return;
    }

    if (steps.length === 0 || steps.some(s => !s.toolId)) {
      toast.error('Please add at least one step with a tool');
      return;
    }

    const systemData = {
      name: systemName.trim(),
      description: systemDescription.trim(),
      steps: steps.map(s => ({
        order: s.order,
        toolId: s.toolId,
        toolName: s.toolName || getToolDisplayName(s.toolId),
        notes: s.notes.trim()
      }))
    };

    try {
      if (editingSystem) {
        await updateSystem(editingSystem.id, systemData);
        toast.success('System updated!');
      } else {
        await createSystem(systemData);
        toast.success('System created!');
      }
      
      setShowAddModal(false);
      setEditingSystem(null);
      setSystemName('');
      setSystemDescription('');
      setSteps([{ order: 1, toolId: '', toolName: '', notes: '' }]);
    } catch (error) {
      toast.error('Failed to save system: ' + error.message);
    }
  }, [systemName, systemDescription, steps, editingSystem, createSystem, updateSystem, getToolDisplayName]);

  const handleEdit = useCallback((system) => {
    setEditingSystem(system);
    setSystemName(system.name);
    setSystemDescription(system.description || '');
    setSteps(system.steps.map(s => ({ 
      order: s.order,
      toolId: s.toolId || '',
      toolName: s.toolName || '',
      notes: s.notes || ''
    })));
    setShowAddModal(true);
  }, []);

  const handleDelete = useCallback(async (systemId) => {
    if (window.confirm('Are you sure you want to delete this system?')) {
      try {
        await deleteSystem(systemId);
        toast.success('System deleted!');
      } catch (error) {
        toast.error('Failed to delete system: ' + error.message);
      }
    }
  }, [deleteSystem]);

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  }, [logout, navigate]);

  const handleOpenTool = useCallback((toolId) => {
    const tool = getToolById(toolId);
    if (tool && tool.url) {
      window.open(tool.url, '_blank');
    }
  }, [getToolById]);

  return (
    <div className="min-h-screen w-full relative" data-testid="systems-page">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-900" />
      <div className="absolute inset-0 radial-bg" />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-20 glass border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" />
              <h1 className="text-lg sm:text-2xl font-bold gradient-text whitespace-nowrap">
                Systems & Processes
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              size="sm"
              onClick={() => {
                setEditingSystem(null);
                setSystemName('');
                setSystemDescription('');
                setSteps([{ order: 1, toolId: '', toolName: '', notes: '' }]);
                setShowAddModal(true);
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-1 sm:gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New System</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="gap-1 sm:gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {systems && systems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systems.map((system) => (
              <motion.div
                key={system.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border border-white/10 hover:border-violet-400/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-500" />
                      {system.name}
                    </h3>
                    {system.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {system.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(system)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(system.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {system.steps && system.steps.length > 0 ? (
                    system.steps
                      .sort((a, b) => a.order - b.order)
                      .map((step, idx) => {
                        const tool = step.toolId ? getToolById(step.toolId) : null;
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/10 dark:bg-white/5 border border-white/10 hover:bg-white/20 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 dark:bg-violet-400/20 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-400">
                              {step.order}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {tool && tool.favicon && (
                                  <img 
                                    src={tool.favicon} 
                                    alt={tool.title}
                                    className="w-5 h-5 rounded object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {step.toolName || (tool ? tool.title : 'Unknown Tool')}
                                </p>
                                {tool && tool.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleOpenTool(step.toolId)}
                                    title="Open tool"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                              {step.notes && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                                  {step.notes}
                                </p>
                              )}
                            </div>
                            {idx < system.steps.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-violet-400/50 flex-shrink-0 mt-2" />
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No steps defined</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-8 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
              <Workflow className="w-16 h-16 text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3 gradient-text">
              No Systems Yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg text-lg">
              Create your first system or process workflow. Link your tools (nodes) together to build powerful workflows!
            </p>
            <Button
              onClick={() => {
                setEditingSystem(null);
                setSystemName('');
                setSystemDescription('');
                setSteps([{ order: 1, toolId: '', toolName: '', notes: '' }]);
                setShowAddModal(true);
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-8 py-6 text-lg"
            >
              <Plus className="w-5 h-5" />
              Create Your First System
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add/Edit System Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              {editingSystem ? 'Edit System' : 'Create New System'}
            </DialogTitle>
            <DialogDescription>
              Link your tools (nodes) together to create a workflow or process
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">System Name</label>
              <Input
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="e.g., Vibing Coding Process"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                value={systemDescription}
                onChange={(e) => setSystemDescription(e.target.value)}
                placeholder="Brief description of this system..."
                rows={2}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Steps</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStep}
                  className="gap-2"
                  disabled={tools.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </Button>
              </div>

              {tools.length === 0 && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    No tools available. Add tools on the dashboard first!
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {steps.map((step, index) => {
                  const selectedTool = step.toolId ? getToolById(step.toolId) : null;
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 dark:bg-violet-400/20 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-400 mt-1">
                          {step.order}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="text-xs font-medium mb-1 block text-gray-600 dark:text-gray-400">
                              Tool (Node)
                            </label>
                            <Select
                              value={step.toolId}
                              onValueChange={(value) => handleStepChange(index, 'toolId', value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a tool...">
                                  {selectedTool && (
                                    <div className="flex items-center gap-2">
                                      {selectedTool.favicon && (
                                        <img 
                                          src={selectedTool.favicon} 
                                          alt={selectedTool.title}
                                          className="w-4 h-4 rounded"
                                          onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                      )}
                                      {selectedTool.title}
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {tools.map((tool) => (
                                  <SelectItem key={tool.id} value={tool.id}>
                                    <div className="flex items-center gap-2">
                                      {tool.favicon && (
                                        <img 
                                          src={tool.favicon} 
                                          alt={tool.title}
                                          className="w-4 h-4 rounded"
                                          onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                      )}
                                      {tool.title}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block text-gray-600 dark:text-gray-400">
                              Notes (Optional)
                            </label>
                            <Textarea
                              value={step.notes}
                              onChange={(e) => handleStepChange(index, 'notes', e.target.value)}
                              placeholder="Add notes or context for this step..."
                              rows={2}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveStep(index, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveStep(index, 'down')}
                            disabled={index === steps.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStep(index)}
                            disabled={steps.length === 1}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
              {editingSystem ? 'Update' : 'Create'} System
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Systems;
