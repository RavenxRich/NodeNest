import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Download, Database, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const navigate = useNavigate();
  const { storageMode, importTools, exportTools } = useStorage();
  const [importFormat, setImportFormat] = useState('json');
  const [importData, setImportData] = useState('');
  const [llmProvider, setLlmProvider] = useState(() => {
    return localStorage.getItem('llmProvider') || 'anthropic';
  });
  const [localEndpoint, setLocalEndpoint] = useState(() => {
    return localStorage.getItem('localLlmEndpoint') || '';
  });
  const [localModel, setLocalModel] = useState(() => {
    return localStorage.getItem('localLlmModel') || 'default';
  });
  const [localApiKey, setLocalApiKey] = useState(() => {
    return localStorage.getItem('localLlmApiKey') || '';
  });
  const [loading, setLoading] = useState(false);

  const handleSaveLlmSettings = () => {
    localStorage.setItem('llmProvider', llmProvider);
    if (llmProvider === 'local') {
      localStorage.setItem('localLlmEndpoint', localEndpoint);
      localStorage.setItem('localLlmModel', localModel);
      localStorage.setItem('localLlmApiKey', localApiKey);
    }
    toast.success('LLM settings saved!');
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Please paste data to import');
      return;
    }

    setLoading(true);
    try {
      const result = await importTools(importFormat, importData);
      toast.success(result.message);
      setImportData('');
    } catch (error) {
      toast.error('Import failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const result = await exportTools(format);
      const blob = new Blob([result.data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nodenest-export-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export successful!');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            data-testid="back-btn"
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">Manage your NodeNest preferences</p>

          <div className="space-y-6">
            {/* Storage Info */}
            <Card data-testid="storage-info-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Storage Mode
                </CardTitle>
                <CardDescription>
                  Your current storage configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full ${
                    storageMode === 'local' ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                  }`}>
                    <span className="font-semibold capitalize">{storageMode} Storage</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LLM Provider */}
            <Card data-testid="llm-provider-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Model Provider
                </CardTitle>
                <CardDescription>
                  Choose which AI model to use for metadata extraction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Provider</Label>
                    <Select value={llmProvider} onValueChange={setLlmProvider}>
                      <SelectTrigger data-testid="llm-provider-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anthropic">Claude Sonnet 4 (Recommended)</SelectItem>
                        <SelectItem value="openai">GPT-5.1</SelectItem>
                        <SelectItem value="gemini">Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="local">Local LLM (Ollama, LMStudio, etc.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {llmProvider === 'local' && (
                    <div className="space-y-4 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-800">
                      <div>
                        <Label htmlFor="local-endpoint">OpenAI-Compatible Endpoint</Label>
                        <Input
                          id="local-endpoint"
                          data-testid="local-endpoint-input"
                          type="text"
                          placeholder="http://localhost:11434 or http://localhost:1234"
                          value={localEndpoint}
                          onChange={(e) => setLocalEndpoint(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Works with Ollama, LM Studio, LocalAI, etc.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="local-model">Model Name</Label>
                        <Input
                          id="local-model"
                          data-testid="local-model-input"
                          type="text"
                          placeholder="llama3.2, mistral, qwen2.5, etc."
                          value={localModel}
                          onChange={(e) => setLocalModel(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="local-api-key">API Key (Optional)</Label>
                        <Input
                          id="local-api-key"
                          data-testid="local-api-key-input"
                          type="password"
                          placeholder="Leave empty if not needed"
                          value={localApiKey}
                          onChange={(e) => setLocalApiKey(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Current: <span className="font-semibold">
                      {llmProvider === 'anthropic' ? 'Claude' : 
                       llmProvider === 'openai' ? 'GPT' : 
                       llmProvider === 'gemini' ? 'Gemini' : 
                       'Local LLM'}
                    </span>
                  </p>
                  {llmProvider !== 'local' && (
                    <p className="text-xs text-muted-foreground">
                      Note: Using Emergent LLM Key for cloud AI features
                    </p>
                  )}
                  <Button 
                    onClick={handleSaveLlmSettings}
                    className="w-full"
                    data-testid="save-llm-settings-btn"
                  >
                    Save LLM Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Import/Export */}
            <Card data-testid="import-export-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Tools
                </CardTitle>
                <CardDescription>
                  Bulk import tools from JSON or CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Format</Label>
                    <Select value={importFormat} onValueChange={setImportFormat}>
                      <SelectTrigger data-testid="import-format-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Textarea
                      data-testid="import-data-textarea"
                      placeholder={importFormat === 'json' ? '[{"title": "...", "url": "...", ...}]' : 'title,url,description,category_id,tags\nChatGPT,https://...'}
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    data-testid="import-btn"
                    onClick={handleImport}
                    disabled={loading}
                    className="w-full gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Tools
                </CardTitle>
                <CardDescription>
                  Download your tools collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    data-testid="export-json-btn"
                    onClick={() => handleExport('json')}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as JSON
                  </Button>
                  <Button
                    data-testid="export-csv-btn"
                    onClick={() => handleExport('csv')}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
