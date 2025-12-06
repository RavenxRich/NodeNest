// Centralized category definitions with proper structure
export const DEFAULT_CATEGORIES = [
  { id: 'ai_tools', name: 'AI Tools', color: '#8B5CF6' },
  { id: 'productivity', name: 'Productivity', color: '#06B6D4' },
  { id: 'design', name: 'Design', color: '#EC4899' },
  { id: 'development', name: 'Development', color: '#10B981' },
  { id: 'writing', name: 'Writing', color: '#F59E0B' },
  { id: 'research', name: 'Research', color: '#6366F1' },
  { id: 'automation', name: 'Automation', color: '#EF4444' },
  { id: 'communication', name: 'Communication', color: '#14B8A6' },
  { id: 'other', name: 'Other', color: '#64748B' }
];

// Storage keys - centralized to avoid typos
export const STORAGE_KEYS = {
  STORAGE_MODE: 'nodenest_storage_mode',
  USER_ID: 'nodenest_user_id',
  LOCAL_STORAGE_TYPE: 'nodenest_local_storage_type',
  HAS_DIRECTORY: 'nodenest_has_directory',
  TOOLS_ENCRYPTED: 'nodenest_tools_encrypted',
  SYSTEMS_ENCRYPTED: 'nodenest_systems_encrypted',
  LLM_PROVIDER: 'llmProvider',
  LOCAL_LLM_ENDPOINT: 'localLlmEndpoint',
  LOCAL_LLM_MODEL: 'localLlmModel',
  LOCAL_LLM_API_KEY: 'localLlmApiKey',
  CUSTOM_LLM_KEY: 'custom_llm_key_encrypted'
};

// QR Code size limits
export const QR_CODE_MAX_SIZE = 2000; // bytes - safe limit for reliable QR scanning

