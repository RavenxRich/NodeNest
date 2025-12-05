import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { QrCode, AlertTriangle, Copy, Check } from 'lucide-react';
import { useStorage } from '../contexts/StorageContext';
import { createMinimalSyncData, expandMinimalSyncData } from '../utils/compression';
import { STORAGE_KEYS, QR_CODE_MAX_SIZE } from '../utils/constants';
import { encryptData, decryptData } from '../utils/encryption';

const MobileQRCode = () => {
  const { tools, loadTools } = useStorage();
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [isDataTooLarge, setIsDataTooLarge] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncCode, setSyncCode] = useState('');

  // Generate a short sync code for the data
  const generateSyncCode = useCallback(() => {
    const minimalData = createMinimalSyncData(tools);
    const jsonString = JSON.stringify(minimalData);
    
    // Create a unique sync code
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Store in localStorage with the code as key (for same-device testing)
    // In production, this would be stored on a server
    try {
      localStorage.setItem(`nodenest_sync_${code}`, jsonString);
      return code;
    } catch (e) {
      return null;
    }
  }, [tools]);

  const exportLocalStorage = useCallback(() => {
    try {
      // Create minimal sync data for smaller QR code
      const minimalData = createMinimalSyncData(tools);
      const jsonString = JSON.stringify({
        v: 1, // version
        t: minimalData,
        m: localStorage.getItem(STORAGE_KEYS.STORAGE_MODE),
        s: localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE)
      });
      
      // Encode for URL
      const encoded = btoa(encodeURIComponent(jsonString));
      const url = `${window.location.origin}${window.location.pathname}#sync=${encoded}`;
      
      // Check if data is too large for reliable QR scanning
      if (url.length > QR_CODE_MAX_SIZE) {
        setIsDataTooLarge(true);
        // Generate a sync code as alternative
        const code = generateSyncCode();
        setSyncCode(code);
        
        // Create shorter URL with just the sync code
        const shortUrl = `${window.location.origin}${window.location.pathname}#code=${code}`;
        setQrData(shortUrl);
      } else {
        setIsDataTooLarge(false);
        setQrData(url);
      }
      
      setShowQR(true);
      toast.success('QR Code ready! Scan with your mobile device.');
    } catch (error) {
      toast.error('Failed to generate QR code: ' + error.message);
    }
  }, [tools, generateSyncCode]);

  const copyToClipboard = useCallback(async () => {
    try {
      // Export full data for clipboard
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
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  // Handle import from URL hash
  useEffect(() => {
    const handleImport = () => {
      const hash = window.location.hash;
      
      if (hash.startsWith('#sync=')) {
        try {
          const encoded = hash.substring(6);
          const jsonString = decodeURIComponent(atob(encoded));
          const data = JSON.parse(jsonString);
          
          if (data.v === 1 && data.t) {
            // Expand minimal data back to full tools
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
            toast.success('Data imported successfully!');
          }
        } catch (error) {
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
            
            // Clean up sync code
            localStorage.removeItem(`nodenest_sync_${code}`);
            
            window.location.hash = '';
            window.location.reload();
            toast.success('Data imported successfully!');
          } else {
            toast.error('Sync code not found. It may have expired.');
          }
        } catch (error) {
          toast.error('Failed to import data');
        }
      } else if (hash.startsWith('#import=')) {
        // Legacy import format
        try {
          const encoded = hash.substring(8);
          const jsonString = decodeURIComponent(atob(encoded));
          const data = JSON.parse(jsonString);
          
          if (data.tools) localStorage.setItem(STORAGE_KEYS.TOOLS_ENCRYPTED, data.tools);
          if (data.storageMode) localStorage.setItem(STORAGE_KEYS.STORAGE_MODE, data.storageMode);
          if (data.userId) localStorage.setItem(STORAGE_KEYS.USER_ID, data.userId);
          if (data.localStorageType) localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_TYPE, data.localStorageType);
          
          window.location.hash = '';
          window.location.reload();
          toast.success('Data imported successfully!');
        } catch (error) {
          toast.error('Failed to import data');
        }
      }
    };

    handleImport();
  }, []);

  return (
    <div className="relative">
      <Button
        onClick={exportLocalStorage}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <QrCode className="w-4 h-4" />
        Export to Mobile
      </Button>

      {showQR && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 overflow-y-auto"
          onClick={() => setShowQR(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Sync to Mobile</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            {isDataTooLarge && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Large data detected ({tools.length} tools)
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Using sync code method for reliability. Scan the QR code, or manually copy data below.
                  </p>
                  {syncCode && (
                    <p className="text-sm font-mono font-bold text-amber-900 mt-2">
                      Sync Code: {syncCode}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {qrData ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* QR Code Container */}
                <div 
                  className="bg-white p-4 rounded-xl flex items-center justify-center"
                  style={{ border: '3px solid #8b5cf6' }}
                >
                  <QRCodeCanvas 
                    value={qrData} 
                    size={200}
                    level="L"
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                  />
                </div>
                
                {/* Instructions */}
                <div className="text-center w-full">
                  <p className="text-gray-700 font-semibold text-base mb-2">
                    📱 Scan with your phone camera
                  </p>
                  <p className="text-gray-500 text-sm">
                    {isDataTooLarge 
                      ? 'Open the link on your phone while this page is open'
                      : 'Your tools will be imported automatically'}
                  </p>
                </div>
                
                {/* Alternative: Copy button for large data */}
                {isDataTooLarge && (
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Full Data to Clipboard
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4" />
                <p className="text-lg">Generating QR code...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileQRCode;
