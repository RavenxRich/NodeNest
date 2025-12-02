import React, { useState, useEffect } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { ExternalLink, Trash2, Save, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const NodeDetailsSidebar = ({ tool, onClose }) => {
  const { updateTool, deleteTool } = useStorage();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (tool) {
      setFormData({
        title: tool.title || '',
        description: tool.description || '',
        notes: tool.notes || '',
        tags: Array.isArray(tool.tags) ? tool.tags : [],
        favorite: tool.favorite || false
      });
    }
  }, [tool]);

  if (!tool) return null;

  const handleSave = async () => {
    try {
      await updateTool(tool.id, formData);
      toast.success('Tool updated successfully');
      setEditing(false);
      onClose();
    } catch (error) {
      toast.error('Failed to update tool');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      try {
        await deleteTool(tool.id);
        toast.success('Tool deleted');
        onClose();
      } catch (error) {
        toast.error('Failed to delete tool');
      }
    }
  };

  const toggleFavorite = async () => {
    const newFavorite = !formData.favorite;
    setFormData(prev => ({ ...prev, favorite: newFavorite }));
    try {
      await updateTool(tool.id, { favorite: newFavorite });
      toast.success(newFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <Sheet open={!!tool} onOpenChange={onClose}>
      <SheetContent data-testid="node-details-sidebar" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {tool.favicon && (
                <img src={tool.favicon} alt="" className="w-12 h-12 rounded-lg" />
              )}
              <div>
                <SheetTitle className="text-xl">{tool.title}</SheetTitle>
                <a 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-violet-500 hover:underline flex items-center gap-1 mt-1"
                >
                  Visit Tool <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <Button
              size="sm"
              variant={formData.favorite ? "default" : "outline"}
              onClick={toggleFavorite}
              data-testid="favorite-btn"
            >
              <Star className={`w-4 h-4 ${formData.favorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-4 rounded-lg space-y-2"
          >
            <h3 className="font-semibold text-sm text-muted-foreground">Usage Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{tool.click_count || 0}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {tool.last_used ? new Date(tool.last_used).toLocaleDateString() : 'Never'}
                </p>
                <p className="text-xs text-muted-foreground">Last Used</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">
                {tool.date_added ? new Date(tool.date_added).toLocaleDateString() : 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">Date Added</p>
            </div>
          </motion.div>

          {/* Editable Fields */}
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  }))}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.description && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm">{formData.description}</p>
                </div>
              )}
              {formData.tags && formData.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {formData.notes && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Notes</h3>
                  <p className="text-sm whitespace-pre-wrap">{formData.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  data-testid="save-tool-btn"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  data-testid="edit-tool-btn"
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  data-testid="delete-tool-btn"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NodeDetailsSidebar;
