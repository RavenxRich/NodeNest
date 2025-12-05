import React, { useState, useCallback, useMemo } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Loader2, Sparkles, X } from 'lucide-react';
import { STORAGE_KEYS, DEFAULT_CATEGORIES } from '../utils/constants';

const INITIAL_FORM_STATE = {
  url: '',
  title: '',
  description: '',
  category_id: DEFAULT_CATEGORIES[0]?.id || 'ai_tools',
  tags: [],
  favicon: '',
  notes: '',
  favorite: false
};

const AddNodeModal = ({ open, onClose }) => {
  const { categories, addTool, extractMetadata, loadTools } = useStorage();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [tagInput, setTagInput] = useState('');

  // Normalize URL - add https if missing
  const normalizeUrl = useCallback((url) => {
    let normalized = url.trim();
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized;
    }
    return normalized;
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setTagInput('');
  }, []);

  // Handle metadata extraction with AI
  const handleExtractMetadata = useCallback(async () => {
    if (!formData.url) {
      toast.error('Please enter a URL first');
      return;
    }

    setExtracting(true);
    try {
      const normalizedUrl = normalizeUrl(formData.url);
      const metadata = await extractMetadata(normalizedUrl);
      setFormData(prev => ({
        ...prev,
        url: normalizedUrl,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        category_id: metadata.category_id || prev.category_id,
        tags: metadata.tags || prev.tags,
        favicon: metadata.favicon || prev.favicon
      }));
      
      const llmProvider = localStorage.getItem(STORAGE_KEYS.LLM_PROVIDER) || 'anthropic';
      const providerName = llmProvider === 'local' ? 'Local LLM' : 
                          llmProvider === 'anthropic' ? 'Claude' : 
                          llmProvider === 'openai' ? 'GPT' : 'Gemini';
      toast.success(`Metadata extracted using ${providerName}!`);
    } catch (error) {
      toast.error('Failed to extract metadata. Please fill in manually.');
    } finally {
      setExtracting(false);
    }
  }, [formData.url, normalizeUrl, extractMetadata]);

  // Handle adding tags
  const handleAddTag = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagInput('');
      }
    }
  }, [tagInput, formData.tags]);

  // Handle removing tags
  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Handle form field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.url || !formData.title) {
      toast.error('URL and title are required');
      return;
    }

    setLoading(true);
    try {
      const normalizedUrl = normalizeUrl(formData.url);
      await addTool({ ...formData, url: normalizedUrl });
      await loadTools();
      toast.success('Tool added successfully!');
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Failed to add tool. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, normalizeUrl, addTool, loadTools, onClose, resetForm]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  // Memoized category options
  const categoryOptions = useMemo(() => 
    categories.map(cat => (
      <SelectItem key={cat.id} value={cat.id}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
          {cat.name}
        </div>
      </SelectItem>
    )), [categories]);

  // Memoized tag badges
  const tagBadges = useMemo(() => 
    formData.tags.map(tag => (
      <Badge key={tag} variant="secondary" className="gap-1">
        {tag}
        <button
          type="button"
          onClick={() => removeTag(tag)}
          className="ml-1 hover:text-destructive transition-colors"
          aria-label={`Remove ${tag} tag`}
        >
          <X className="w-3 h-3" />
        </button>
      </Badge>
    )), [formData.tags, removeTag]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="add-node-modal" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Tool</DialogTitle>
          <DialogDescription>
            Paste a URL (e.g., claude.ai) and let AI extract the metadata, or fill in manually.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                data-testid="url-input"
                type="text"
                placeholder="claude.ai or https://example.com"
                value={formData.url}
                onChange={(e) => handleFieldChange('url', e.target.value)}
                required
                className="flex-1"
                disabled={loading}
              />
              <Button
                type="button"
                data-testid="extract-metadata-btn"
                onClick={handleExtractMetadata}
                disabled={extracting || !formData.url || loading}
                variant="outline"
                className="gap-2"
              >
                {extracting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                AI Extract
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Tip: You can type just "claude.ai" - https:// is added automatically</p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              data-testid="title-input"
              type="text"
              placeholder="Tool name"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              data-testid="description-input"
              placeholder="What does this tool do?"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleFieldChange('category_id', value)}
              disabled={loading}
            >
              <SelectTrigger data-testid="category-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions}
              </SelectContent>
            </Select>
          </div>

          {/* Tags as Badges */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tagBadges}
              </div>
            )}
            <Input
              id="tags"
              data-testid="tags-input"
              type="text"
              placeholder="Type a tag and press Enter or comma"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Press Enter or comma to add tags</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              data-testid="notes-input"
              placeholder="Add any personal notes..."
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="add-tool-submit-btn"
              disabled={loading || !formData.url || !formData.title}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Tool'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNodeModal;
