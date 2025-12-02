import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

const AddNodeModal = ({ open, onClose }) => {
  const { categories, addTool, extractMetadata } = useStorage();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    category_id: 'chat-assistants',
    tags: [],
    favicon: '',
    notes: '',
    favorite: false
  });

  const handleExtractMetadata = async () => {
    if (!formData.url) {
      toast.error('Please enter a URL first');
      return;
    }

    setExtracting(true);
    try {
      const metadata = await extractMetadata(formData.url);
      setFormData(prev => ({
        ...prev,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        category_id: metadata.category_id || prev.category_id,
        tags: metadata.tags || prev.tags,
        favicon: metadata.favicon || prev.favicon
      }));
      
      // Show which LLM was used
      const llmProvider = localStorage.getItem('llmProvider') || 'anthropic';
      const providerName = llmProvider === 'local' ? 'Local LLM' : 
                          llmProvider === 'anthropic' ? 'Claude' : 
                          llmProvider === 'openai' ? 'GPT' : 'Gemini';
      toast.success(`Metadata extracted using ${providerName}!`);
    } catch (error) {
      toast.error('Failed to extract metadata');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.url || !formData.title) {
      toast.error('URL and title are required');
      return;
    }

    setLoading(true);
    try {
      await addTool(formData);
      toast.success('Tool added successfully!');
      onClose();
      // Reset form
      setFormData({
        url: '',
        title: '',
        description: '',
        category_id: 'chat-assistants',
        tags: [],
        favicon: '',
        notes: '',
        favorite: false
      });
    } catch (error) {
      toast.error('Failed to add tool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="add-node-modal" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Tool</DialogTitle>
          <DialogDescription>
            Paste a URL and let AI extract the metadata, or fill in manually.
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
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
                className="flex-1"
              />
              <Button
                type="button"
                data-testid="extract-metadata-btn"
                onClick={handleExtractMetadata}
                disabled={extracting || !formData.url}
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
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger data-testid="category-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              data-testid="tags-input"
              type="text"
              placeholder="ai, chatbot, productivity"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              data-testid="notes-input"
              placeholder="Add any personal notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="add-tool-submit-btn"
              disabled={loading}
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
