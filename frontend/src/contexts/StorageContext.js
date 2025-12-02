import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { encryptData, decryptData } from '../utils/encryption';

const StorageContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};

export const StorageProvider = ({ children }) => {
  const [storageMode, setStorageMode] = useState(() => {
    return localStorage.getItem('nodenest_storage_mode') || null;
  });
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('nodenest_user_id') || null;
  });
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [localStorageType, setLocalStorageType] = useState(() => {
    return localStorage.getItem('nodenest_local_storage_type') || 'browser'; // 'browser' or 'filesystem'
  });

  // Initialize storage mode
  const selectStorageMode = async (mode, googleUser = null, storageType = 'browser') => {
    setStorageMode(mode);
    localStorage.setItem('nodenest_storage_mode', mode);
    
    if (mode === 'cloud' && googleUser) {
      const uid = googleUser.sub || googleUser.email;
      setUserId(uid);
      localStorage.setItem('nodenest_user_id', uid);
    } else if (mode === 'local') {
      setUserId('local_user');
      localStorage.setItem('nodenest_user_id', 'local_user');
      setLocalStorageType(storageType);
      localStorage.setItem('nodenest_local_storage_type', storageType);
      
      // If filesystem storage, prompt user to select directory
      if (storageType === 'filesystem') {
        try {
          if ('showDirectoryPicker' in window) {
            const handle = await window.showDirectoryPicker({
              mode: 'readwrite',
              startIn: 'documents'
            });
            setDirectoryHandle(handle);
            // Store directory handle reference
            localStorage.setItem('nodenest_has_directory', 'true');
            return { success: true };
          } else {
            throw new Error('File System Access API not supported');
          }
        } catch (error) {
          console.error('Error selecting directory:', error);
          return { success: false, error: error.message };
        }
      }
    }
    return { success: true };
  };

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load tools
  const loadTools = async () => {
    if (!storageMode) return;

    try {
      if (storageMode === 'local') {
        const encryptedData = localStorage.getItem('nodenest_tools_encrypted');
        const localTools = encryptedData ? decryptData(encryptedData) : [];
        setTools(localTools || []);
      } else if (storageMode === 'cloud') {
        const response = await axios.get(`${API}/tools`, {
          params: { user_id: userId }
        });
        setTools(response.data);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
      setTools([]);
    }
  };

  // Save tools
  const saveTools = async (updatedTools) => {
    setTools(updatedTools);

    if (storageMode === 'local') {
      const encrypted = encryptData(updatedTools);
      if (encrypted) {
        localStorage.setItem('nodenest_tools_encrypted', encrypted);
      }
    }
  };

  // Add tool
  const addTool = async (toolData) => {
    try {
      if (storageMode === 'local') {
        // Auto-generate favicon if not provided
        if (!toolData.favicon && toolData.url) {
          try {
            const urlObj = new URL(toolData.url);
            toolData.favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
          } catch (e) {
            console.error('Error generating favicon:', e);
          }
        }
        
        const newTool = {
          ...toolData,
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date_added: new Date().toISOString(),
          click_count: 0,
          last_used: null
        };
        const updatedTools = [...tools, newTool];
        await saveTools(updatedTools);
        return newTool;
      } else if (storageMode === 'cloud') {
        const response = await axios.post(`${API}/tools`, {
          ...toolData,
          user_id: userId
        });
        await loadTools();
        return response.data;
      }
    } catch (error) {
      console.error('Error adding tool:', error);
      throw error;
    }
  };

  // Update tool
  const updateTool = async (toolId, updates) => {
    try {
      if (storageMode === 'local') {
        const updatedTools = tools.map(t => 
          t.id === toolId ? { ...t, ...updates } : t
        );
        await saveTools(updatedTools);
      } else if (storageMode === 'cloud') {
        await axios.put(`${API}/tools/${toolId}`, updates);
        await loadTools();
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      throw error;
    }
  };

  // Delete tool
  const deleteTool = async (toolId) => {
    try {
      if (storageMode === 'local') {
        const updatedTools = tools.filter(t => t.id !== toolId);
        await saveTools(updatedTools);
      } else if (storageMode === 'cloud') {
        await axios.delete(`${API}/tools/${toolId}`);
        await loadTools();
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw error;
    }
  };

  // Track click
  const trackClick = async (toolId) => {
    try {
      if (storageMode === 'local') {
        const updatedTools = tools.map(t => {
          if (t.id === toolId) {
            return {
              ...t,
              click_count: (t.click_count || 0) + 1,
              last_used: new Date().toISOString()
            };
          }
          return t;
        });
        await saveTools(updatedTools);
      } else if (storageMode === 'cloud') {
        await axios.post(`${API}/tools/${toolId}/track-click`);
        await loadTools();
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  // Extract metadata
  const extractMetadata = async (url) => {
    try {
      const llmProvider = localStorage.getItem('llmProvider') || 'anthropic';
      const llmModel = llmProvider === 'local' 
        ? localStorage.getItem('localLlmModel') || 'default'
        : llmProvider === 'anthropic' ? 'claude-4-sonnet-20250514'
        : llmProvider === 'openai' ? 'gpt-5.1'
        : 'gemini-2.5-flash';
      
      const payload = {
        url,
        llm_provider: llmProvider,
        llm_model: llmModel
      };

      if (llmProvider === 'local') {
        payload.local_endpoint = localStorage.getItem('localLlmEndpoint') || '';
        payload.local_api_key = localStorage.getItem('localLlmApiKey') || '';
      }

      const response = await axios.post(`${API}/tools/extract-metadata`, payload);
      return response.data;
    } catch (error) {
      console.error('Error extracting metadata:', error);
      throw error;
    }
  };

  // Import tools
  const importTools = async (format, data) => {
    try {
      if (storageMode === 'local') {
        let importedTools = [];
        if (format === 'json') {
          importedTools = JSON.parse(data);
        } else if (format === 'csv') {
          const lines = data.trim().split('\n');
          const headers = lines[0].split(',');
          importedTools = lines.slice(1).map(line => {
            const values = line.split(',');
            const tool = {};
            headers.forEach((header, i) => {
              tool[header.trim()] = values[i]?.trim() || '';
            });
            return {
              ...tool,
              id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              tags: tool.tags ? tool.tags.split(';') : [],
              click_count: parseInt(tool.click_count) || 0,
              date_added: new Date().toISOString()
            };
          });
        }
        const updatedTools = [...tools, ...importedTools];
        await saveTools(updatedTools);
        return { message: `Successfully imported ${importedTools.length} tools` };
      } else if (storageMode === 'cloud') {
        const response = await axios.post(`${API}/tools/import`, {
          format,
          data,
          user_id: userId
        });
        await loadTools();
        return response.data;
      }
    } catch (error) {
      console.error('Error importing tools:', error);
      throw error;
    }
  };

  // Export tools
  const exportTools = async (format) => {
    try {
      if (storageMode === 'local') {
        if (format === 'json') {
          return { data: JSON.stringify(tools, null, 2) };
        } else if (format === 'csv') {
          const headers = ['id', 'title', 'url', 'description', 'category_id', 'tags', 'click_count', 'date_added'];
          const csv = [headers.join(',')];
          tools.forEach(tool => {
            const row = headers.map(header => {
              let value = tool[header] || '';
              if (header === 'tags' && Array.isArray(value)) {
                value = value.join(';');
              }
              return `"${value}"`;
            });
            csv.push(row.join(','));
          });
          return { data: csv.join('\n') };
        }
      } else if (storageMode === 'cloud') {
        const response = await axios.get(`${API}/tools/export/${format}`, {
          params: { user_id: userId }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error exporting tools:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (storageMode) {
      loadTools();
    }
  }, [storageMode, userId]);

  const value = {
    storageMode,
    userId,
    tools,
    categories,
    selectStorageMode,
    loadTools,
    addTool,
    updateTool,
    deleteTool,
    trackClick,
    extractMetadata,
    importTools,
    exportTools
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};
