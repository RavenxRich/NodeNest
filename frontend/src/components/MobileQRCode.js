import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { QrCode, AlertTriangle, Copy, Check, RefreshCw } from 'lucide-react';
import { useStorage } from '../contexts/StorageContext';
import { createMinimalSyncData, expandMinimalSyncData } from '../utils/compression';
import { STORAGE_KEYS, QR_CODE_MAX_SIZE } from '../utils/constants';
import { encryptData } from '../utils/encryption';

const MobileQRCode = () => {
  const { tools } = useStorage();
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [isDataTooLarge, setIsDataTooLarge] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a short sync code for the data
  const generateSyncCode = useCallback(() => {
    const minimalData = createMinimalSyncData(tools);
    const jsonString = JSON.stringify(minimalData);
    
    // Create a unique sync code
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Store in localStorage with the code as key
    try {
      localStorage.setItem(`nodenest_sync_${code}`, jsonString);
      return code;
    } catch (e) {
      console.error('Failed to save sync code:', e);
      return null;
    }
  }, [tools]);

  const generateQRCode = useCallback(() => {
    setIsGenerating(true);
    setError(null);
    setQrData(null);
    
    try {
      // Create minimal sync data for smaller QR code
      const minimalData = createMinimalSyncData(tools || []);
      const jsonString = JSON.stringify({
        v: 1, // version
        t: minimalData,
        m: localStorage.getItem(STORAGE_KEYS.STORAGE_MODE) || 'local',
        s: localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE) || 'browser'
      });
      
      // Encode for URL
      const encoded = btoa(unescape(encodeURIComponent(jsonString)));
      
      // Build the URL - use current origin and path
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');
      const url = `${baseUrl}#sync=${encoded}`;
      
      // Check if data is too large for reliable QR scanning
      if (url.length > (QR_CODE_MAX_SIZE || 2000)) {
        setIsDataTooLarge(true);
        // Generate a sync code as alternative
        const code = generateSyncCode();
        setSyncCode(code || '');
        
        // Create shorter URL with just the sync code
        const shortUrl = `${baseUrl}#code=${code}`;
        setQrData(shortUrl);
      } else {
        setIsDataTooLarge(false);
        setSyncCode('');
        setQrData(url);
      }
      
      setIsGenerating(false);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      setError(err.message || 'Failed to generate QR code');
      setIsGenerating(false);
    }
  }, [tools, generateSyncCode]);

  const handleOpenModal = useCallback(() => {
    setShowQR(true);
    // Generate QR code after modal opens
    setTimeout(() => generateQRCode(), 100);
  }, [generateQRCode]);

  const handleCloseModal = useCallback(() => {
    setShowQR(false);
    setQrData(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      const encryptedData = localStorage.getItem(STORAGE_KEYS.TOOLS_ENCRYPTED);
      const data = {
        tools: encryptedData,
        storageMode: localStorage.getItem(STORAGE_KEYS.STORAGE_MODE),
        userId: localStorage.getItem(STORAGE_KEYS.USER_ID),
        localStorageType: localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE)
      };
      
      await navigator.clipboard.writeText(JSON.stringify(data));
      setCopied(true);
      toast.success('Data copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  // Handle import from URL hash on mount
  useEffect(() => {
    const handleImport = () => {
      const hash = window.location.hash;
      
      if (hash.startsWith('#sync=')) {
        try {
          const encoded = hash.substring(6);
          const jsonString = decodeURIComponent(escape(atob(encoded)));
          const data = JSON.parse(jsonString);
          
          if (data.v === 1 && data.t) {
            const expandedTools = expandMinimalSyncData(data.t);
            const encrypted = encryptData(expandedTools);
            
            if (encrypted) {
              localStorage.setItem(STORAGE_KEYS.TOOLS_ENCRYPTED, encrypted);
            }
            if (data.m) localStorage.setItem(STORAGE_KEYS.STORAGE_MODE, data.m);
            if (data.s) localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE, data.s);
            localStorage.setItem(STORAGE_KEYS.USER_ID, 'local_user');
            
            window.location.hash = '';
            window.location.reload();
          }
        } catch (err) {
          console.error('Import error:', err);
          toast.error('Failed to import data from QR code');
        }
      } else if (hash.startsWith('#code=')) {
        try {
          const code = hash.substring(6);
          const storedData = localStorage.getItem(`nodenest_sync_${code}`);
          
          if (storedData) {
            const minimalTools = JSON.parse(storedData);
            const expandedTools = expandMinimalSyncData(minimalTools);
            const encrypted = encryptData(expandedTools);
            
            if (encrypted) {
              localStorage.setItem(STORAGE_KEYS.TOOLS_ENCRYPTED, encrypted);
            }
            localStorage.setItem(STORAGE_KEYS.STORAGE_MODE, 'local');
            localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE, 'browser');
            localStorage.setItem(STORAGE_KEYS.USER_ID, 'local_user');
            
            localStorage.removeItem(`nodenest_sync_${code}`);
            
            window.location.hash = '';
            window.location.reload();
          } else {
            toast.error('Sync code not found or expired.');
          }
        } catch (err) {
          console.error('Import error:', err);
          toast.error('Failed to import data');
        }
      }
    };

    handleImport();
  }, []);

  return (
    <div className="relative">
      <Button
        onClick={handleOpenModal}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 sm:gap-2"
        title="Sync to Mobile"
      >
        <QrCode className="w-4 h-4" />
        <span className="hidden sm:inline">Sync</span>
      </Button>

      {showQR && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          style={{ zIndex: 99999 }}
          onClick={handleCloseModal}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sync to Mobile</h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            {/* Large data warning */}
            {isDataTooLarge && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Large data ({tools?.length || 0} tools)
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Using sync code for reliability.
                  </p>
                  {syncCode && (
                    <p className="text-sm font-mono font-bold text-amber-900 dark:text-amber-100 mt-2">
                      Code: {syncCode}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Content Area */}
            <div className="flex flex-col items-center justify-center min-h-[280px]">
              {error ? (
                // Error state
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <Button onClick={generateQRCode} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : isGenerating || !qrData ? (
                // Loading state
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">Generating QR code...</p>
                </div>
              ) : (
                // QR Code display
                <div className="flex flex-col items-center space-y-4 w-full">
                  {/* QR Code */}
                  <div 
                    className="bg-white p-4 rounded-xl shadow-lg"
                    style={{ border: '3px solid #8b5cf6' }}
                  >
                    <QRCodeCanvas 
                      value={qrData} 
                      size={200}
                      level="M"
                      includeMargin={true}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  
                  {/* Instructions */}
                  <div className="text-center">
                    <p className="text-gray-800 dark:text-gray-200 font-semibold mb-1">
                      📱 Scan with your phone
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {isDataTooLarge 
                        ? 'Open link while this page is open'
                        : 'Tools import automatically'}
                    </p>
                  </div>
                  
                  {/* Copy button for large data */}
                  {isDataTooLarge && (
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="w-full gap-2 mt-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Data
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileQRCode;
