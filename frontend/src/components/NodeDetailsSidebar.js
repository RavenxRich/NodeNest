import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { ExternalLink, Trash2, Save, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';

const NodeDetailsSidebar = ({ tool, onClose }) => {
  const { updateTool, deleteTool, trackClick } = useStorage();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Initialize form data when tool changes
  useEffect(() => {
    if (tool) {
      setFormData({
        title: tool.title || '',
        description: tool.description || '',
        notes: tool.notes || '',
        tags: Array.isArray(tool.tags) ? tool.tags : [],
        favorite: tool.favorite || false
      });
      setEditing(false); // Reset editing state when tool changes
    }
  }, [tool]);

  // Handle saving changes
  const handleSave = useCallback(async () => {
    try {
      await updateTool(tool.id, formData);
      toast.success('Tool updated successfully');
      setEditing(false);
      onClose();
    } catch (error) {
      toast.error('Failed to update tool');
    }
  }, [tool?.id, formData, updateTool, onClose]);

  // Handle deleting tool
  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      try {
        await deleteTool(tool.id);
        toast.success('Tool deleted');
        onClose();
      } catch (error) {
        toast.error('Failed to delete tool');
      }
    }
  }, [tool?.id, deleteTool, onClose]);

  // Handle visiting tool URL
  const handleVisit = useCallback(async () => {
    if (tool?.url) {
      await trackClick(tool.id);
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  }, [tool?.id, tool?.url, trackClick]);

  // Handle toggling favorite
  const toggleFavorite = useCallback(async () => {
    const newFavorite = !formData.favorite;
    setFormData(prev => ({ ...prev, favorite: newFavorite }));
    try {
      await updateTool(tool.id, { favorite: newFavorite });
      toast.success(newFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      // Revert on error
      setFormData(prev => ({ ...prev, favorite: !newFavorite }));
      toast.error('Failed to update favorite');
    }
  }, [formData.favorite, tool?.id, updateTool]);

  // Handle removing a tag
  const handleRemoveTag = useCallback(async (tagToRemove) => {
    const originalTags = formData.tags;
    const newTags = formData.tags.filter(t => t !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: newTags }));
    try {
      await updateTool(tool.id, { tags: newTags });
      toast.success('Tag removed');
    } catch (error) {
      // Revert on error
      setFormData(prev => ({ ...prev, tags: originalTags }));
      toast.error('Failed to remove tag');
    }
  }, [formData.tags, tool?.id, updateTool]);

  // Handle form field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle tags input change
  const handleTagsChange = useCallback((e) => {
    const newTags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags: newTags }));
  }, []);

  // Memoized tag badges
  const tagBadges = useMemo(() => 
    formData.tags?.map(tag => (
      <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1 group">
        {tag}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveTag(tag);
          }}
          className="ml-1 hover:text-destructive transition-colors focus:outline-none"
          title="Remove tag"
          aria-label={`Remove ${tag} tag`}
        >
          <X className="w-3 h-3" />
        </button>
      </Badge>
    )) || [], [formData.tags, handleRemoveTag]);

  // Memoized formatted dates
  const formattedDates = useMemo(() => ({
    lastUsed: tool?.last_used ? new Date(tool.last_used).toLocaleDateString() : 'Never',
    dateAdded: tool?.date_added ? new Date(tool.date_added).toLocaleDateString() : 'Unknown'
  }), [tool?.last_used, tool?.date_added]);

  if (!tool) return null;

  return (
    <Sheet open={!!tool} onOpenChange={onClose}>
      <SheetContent data-testid="node-details-sidebar" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {tool.favicon && (
                <img 
                  src={tool.favicon} 
                  alt="" 
                  className="w-12 h-12 rounded-lg"
                  loading="lazy"
                />
              )}
              <div>
                <SheetTitle className="text-xl">{tool.title}</SheetTitle>
                <button 
                  onClick={handleVisit}
                  className="text-sm text-violet-500 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                >
                  Visit Tool <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
            <Button
              size="sm"
              variant={formData.favorite ? "default" : "outline"}
              onClick={toggleFavorite}
              data-testid="favorite-btn"
              className={formData.favorite ? "bg-yellow-500 hover:bg-yellow-600" : ""}
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
                <p className="text-sm font-medium">{formattedDates.lastUsed}</p>
                <p className="text-xs text-muted-foreground">Last Used</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{formattedDates.dateAdded}</p>
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
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags?.join(', ') || ''}
                  onChange={handleTagsChange}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
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
                    {tagBadges}
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
                  type="button"
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
