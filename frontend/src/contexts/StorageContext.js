import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { encryptData, decryptData } from '../utils/encryption';
import { openDB, getHandle, setHandle } from '../utils/indexedDB';
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from '../utils/constants';
import { toast } from 'sonner';

const StorageContext = createContext();

// Backend URL - optional, app works fully offline without it
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;
const HAS_BACKEND = !!API;

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};

export const StorageProvider = ({ children }) => {
  // Initialize state synchronously from localStorage to avoid race conditions
  const [storageMode, setStorageMode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.STORAGE_MODE);
  });
  
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
  });
  
  const [tools, setTools] = useState([]);
  const [categories] = useState(DEFAULT_CATEGORIES);
  const [directoryHandle, setDirectoryHandle] = useState(null);
  
  const [localStorageType, setLocalStorageType] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE) || 'browser';
  });

  // Initialize storage mode
  const selectStorageMode = async (mode, googleUser = null, storageType = 'browser') => {
    if (mode === 'cloud' && googleUser) {
      const uid = googleUser.sub || googleUser.email;
      setUserId(uid);
      localStorage.setItem(STORAGE_KEYS.USER_ID, uid);
      setStorageMode(mode);
      localStorage.setItem(STORAGE_KEYS.STORAGE_MODE, mode);
    } else if (mode === 'local') {
      if (storageType === 'filesystem') {
        try {
          if (!('showDirectoryPicker' in window)) {
            throw new Error('File System Access API not supported in your browser. Please use Chrome, Edge, or Brave.');
          }
          
          if (window.self !== window.top) {
            throw new Error('Folder storage cannot be used in preview mode. Please open the app in a new tab.');
          }
          
          let handle = directoryHandle;
          const hasDirectory = localStorage.getItem(STORAGE_KEYS.HAS_DIRECTORY);
          
          // Try to get existing handle from IndexedDB
          if (!handle && hasDirectory === 'true') {
            try {
              handle = await getHandle('directory');
              
              if (handle) {
                const permission = await handle.queryPermission({ mode: 'readwrite' });
                if (permission !== 'granted') {
                  handle = null;
                  localStorage.removeItem(STORAGE_KEYS.HAS_DIRECTORY);
                }
              } else {
                localStorage.removeItem(STORAGE_KEYS.HAS_DIRECTORY);
              }
            } catch (error) {
              handle = null;
              localStorage.removeItem(STORAGE_KEYS.HAS_DIRECTORY);
            }
          }
          
          // Prompt user if no existing handle
          if (!handle) {
            toast.info('Please select a folder to store your tools');
            handle = await window.showDirectoryPicker({
              mode: 'readwrite',
              startIn: 'documents'
            });
            
            await setHandle(handle, 'directory');
            localStorage.setItem(STORAGE_KEYS.HAS_DIRECTORY, 'true');
          }
          
          setDirectoryHandle(handle);
          setUserId('local_user');
          localStorage.setItem(STORAGE_KEYS.USER_ID, 'local_user');
          setLocalStorageType(storageType);
          localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE, storageType);
          setStorageMode(mode);
          localStorage.setItem(STORAGE_KEYS.STORAGE_MODE, mode);
          
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.name === 'AbortError' 
              ? 'Folder selection was cancelled.' 
              : error.name === 'NotAllowedError'
              ? 'Folder access was blocked. Please check your browser settings.'
              : `Folder access failed: ${error.message}` 
          };
        }
      } else {
        // Browser storage mode
        setUserId('local_user');
        localStorage.setItem(STORAGE_KEYS.USER_ID, 'local_user');
        setLocalStorageType(storageType);
        localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE, storageType);
        setStorageMode(mode);
        localStorage.setItem(STORAGE_KEYS.STORAGE_MODE, mode);
      }
    }
    return { success: true };
  };

  // Read tools from filesystem directory
  const readToolsFromDirectory = useCallback(async (handle) => {
    try {
      const fileHandle = await handle.getFileHandle('nodenest_tools.json', { create: true });
      const file = await fileHandle.getFile();
      const content = await file.text();
      return content.trim() ? JSON.parse(content) : [];
    } catch (error) {
      return [];
    }
  }, []);

  // Load tools from filesystem
  const loadFromFileSystem = useCallback(async () => {
    try {
      let handle = directoryHandle;
      
      if (!handle) {
        const hasDirectory = localStorage.getItem(STORAGE_KEYS.HAS_DIRECTORY);
        if (hasDirectory === 'true') {
          handle = await getHandle('directory');
          
          if (handle) {
            const permission = await handle.queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
              setDirectoryHandle(handle);
            } else if (permission === 'prompt') {
              toast.info('Please confirm folder access in the browser dialog');
              const newPermission = await handle.requestPermission({ mode: 'readwrite' });
              if (newPermission === 'granted') {
                setDirectoryHandle(handle);
                toast.success('Folder access confirmed!');
              } else {
                localStorage.removeItem(STORAGE_KEYS.STORAGE_MODE);
                localStorage.removeItem(STORAGE_KEYS.HAS_DIRECTORY);
                return [];
              }
            } else {
              localStorage.removeItem(STORAGE_KEYS.STORAGE_MODE);
              localStorage.removeItem(STORAGE_KEYS.HAS_DIRECTORY);
              return [];
            }
          } else {
            localStorage.removeItem(STORAGE_KEYS.STORAGE_MODE);
            localStorage.removeItem(STORAGE_KEYS.HAS_DIRECTORY);
            return [];
          }
        } else {
          return [];
        }
      }
      
      return await readToolsFromDirectory(handle);
    } catch (error) {
      return [];
    }
  }, [directoryHandle, readToolsFromDirectory]);

  // Save tools to filesystem
  const saveToFileSystem = useCallback(async (toolsData) => {
    try {
      let handle = directoryHandle;
      
      if (!handle) {
        handle = await getHandle('directory');
        
        if (handle) {
          const permission = await handle.queryPermission({ mode: 'readwrite' });
          if (permission !== 'granted') {
            const newPermission = await handle.requestPermission({ mode: 'readwrite' });
            if (newPermission !== 'granted') {
              return false;
            }
          }
          setDirectoryHandle(handle);
        } else {
          return false;
        }
      }
      
      const fileHandle = await handle.getFileHandle('nodenest_tools.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(toolsData, null, 2));
      await writable.close();
      return true;
    } catch (error) {
      return false;
    }
  }, [directoryHandle]);

  // Load tools - memoized to prevent unnecessary re-renders
  const loadTools = useCallback(async () => {
    if (!storageMode) return;

    try {
      if (storageMode === 'local') {
        if (localStorageType === 'filesystem') {
          const fileTools = await loadFromFileSystem();
          setTools(fileTools || []);
        } else {
          const encryptedData = localStorage.getItem(STORAGE_KEYS.TOOLS_ENCRYPTED);
          const localTools = encryptedData ? decryptData(encryptedData) : [];
          setTools(localTools || []);
        }
      } else if (storageMode === 'cloud') {
        const response = await axios.get(`${API}/tools`, {
          params: { user_id: userId }
        });
        setTools(response.data);
      }
    } catch (error) {
      setTools([]);
    }
  }, [storageMode, localStorageType, userId, loadFromFileSystem]);

  // Save tools - with immediate localStorage persistence
  const saveTools = useCallback(async (updatedTools) => {
    // Update state first for immediate UI feedback
    setTools(updatedTools);

    if (storageMode === 'local') {
      if (localStorageType === 'filesystem') {
        await saveToFileSystem(updatedTools);
      } else {
        // CRITICAL: Always save to localStorage immediately
        const encrypted = encryptData(updatedTools);
        if (encrypted) {
          localStorage.setItem(STORAGE_KEYS.TOOLS_ENCRYPTED, encrypted);
        }
      }
    }
  }, [storageMode, localStorageType, saveToFileSystem]);

  // Add tool
  const addTool = useCallback(async (toolData) => {
    try {
      if (storageMode === 'local') {
        // Auto-generate favicon if not provided
        if (!toolData.favicon && toolData.url) {
          try {
            const urlObj = new URL(toolData.url);
            toolData.favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
          } catch (e) {
            // Invalid URL, skip favicon
          }
        }
        
        const newTool = {
          ...toolData,
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date_added: new Date().toISOString(),
          click_count: 0,
          last_used: null
        };
        
        // Get current tools from state and add new one
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
      throw error;
    }
  }, [storageMode, tools, userId, saveTools, loadTools]);

  // Update tool
  const updateTool = useCallback(async (toolId, updates) => {
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
      throw error;
    }
  }, [storageMode, tools, saveTools, loadTools]);

  // Delete tool
  const deleteTool = useCallback(async (toolId) => {
    try {
      if (storageMode === 'local') {
        const updatedTools = tools.filter(t => t.id !== toolId);
        await saveTools(updatedTools);
      } else if (storageMode === 'cloud') {
        await axios.delete(`${API}/tools/${toolId}`);
        await loadTools();
      }
    } catch (error) {
      throw error;
    }
  }, [storageMode, tools, saveTools, loadTools]);

  // Track click
  const trackClick = useCallback(async (toolId) => {
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
      // Silent fail for tracking
    }
  }, [storageMode, tools, saveTools, loadTools]);

  // Extract metadata - requires backend API
  const extractMetadata = useCallback(async (url) => {
    // Check if backend is available
    if (!HAS_BACKEND) {
      // Fallback: extract basic metadata client-side
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');
        const siteName = hostname.split('.')[0];
        const title = siteName.charAt(0).toUpperCase() + siteName.slice(1);
        
        return {
          title: title,
          description: `Tool from ${hostname}`,
          favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
          category_id: 'ai_tools',
          tags: [hostname.split('.')[0]]
        };
      } catch (e) {
        throw new Error('Invalid URL. Please enter a valid URL.');
      }
    }

    try {
      const llmProvider = localStorage.getItem(STORAGE_KEYS.LLM_PROVIDER) || 'anthropic';
      const llmModel = llmProvider === 'local' 
        ? localStorage.getItem(STORAGE_KEYS.LOCAL_LLM_MODEL) || 'default'
        : llmProvider === 'anthropic' ? 'claude-4-sonnet-20250514'
        : llmProvider === 'openai' ? 'gpt-5.1'
        : 'gemini-2.5-flash';
      
      const payload = {
        url,
        llm_provider: llmProvider,
        llm_model: llmModel
      };

      if (llmProvider === 'local') {
        payload.local_endpoint = localStorage.getItem(STORAGE_KEYS.LOCAL_LLM_ENDPOINT) || '';
        payload.local_api_key = localStorage.getItem(STORAGE_KEYS.LOCAL_LLM_API_KEY) || '';
      }

      const response = await axios.post(`${API}/tools/extract-metadata`, payload);
      return response.data;
    } catch (error) {
      // Fallback to basic extraction on error
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');
        return {
          title: hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1),
          description: '',
          favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
          category_id: 'ai_tools',
          tags: []
        };
      } catch (e) {
        throw error;
      }
    }
  }, []);

  // Import tools
  const importTools = useCallback(async (format, data) => {
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
      throw error;
    }
  }, [storageMode, tools, userId, saveTools, loadTools]);

  // Export tools
  const exportTools = useCallback(async (format) => {
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
      throw error;
    }
  }, [storageMode, tools, userId]);

  // Logout - clear all storage and reset state
  const logout = useCallback(() => {
    // Clear all localStorage keys
    localStorage.removeItem(STORAGE_KEYS.STORAGE_MODE);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE);
    localStorage.removeItem(STORAGE_KEYS.HAS_DIRECTORY);
    localStorage.removeItem(STORAGE_KEYS.TOOLS_ENCRYPTED);
    
    // Reset state
    setStorageMode(null);
    setUserId(null);
    setTools([]);
    setDirectoryHandle(null);
    setLocalStorageType('browser');
  }, []);

  // Load tools when storage mode changes
  useEffect(() => {
    if (storageMode) {
      loadTools();
    }
  }, [storageMode, loadTools]);

  const value = {
    storageMode,
    userId,
    tools,
    categories,
    localStorageType,
    directoryHandle,
    selectStorageMode,
    loadTools,
    addTool,
    updateTool,
    deleteTool,
    trackClick,
    extractMetadata,
    importTools,
    exportTools,
    logout
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};
