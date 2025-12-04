import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { Upload, Download, QrCode, X } from 'lucide-react';

const MobileQRCode = () => {
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const qrRef = useRef(null);
  
  // Debug: Log when QR data changes
  useEffect(() => {
    if (qrData) {
      console.log('✅ QR Data set:', qrData.substring(0, 50) + '...');
      console.log('QR Data length:', qrData.length);
      setQrReady(true);
    }
  }, [qrData]);
  
  // Debug: Log when modal shows
  useEffect(() => {
    if (showQR) {
      console.log('📱 QR Modal opened');
      console.log('QR Data exists:', !!qrData);
      console.log('QR Ready:', qrReady);
    }
  }, [showQR, qrData, qrReady]);

  const exportLocalStorage = () => {
    try {
      // Export all nodenest data from localStorage
      const data = {
        tools: localStorage.getItem('nodenest_tools_encrypted'),
        storageMode: localStorage.getItem('nodenest_storage_mode'),
        userId: localStorage.getItem('nodenest_user_id'),
        localStorageType: localStorage.getItem('nodenest_local_storage_type')
      };
      
      console.log('Exporting data:', data);
      
      const jsonString = JSON.stringify(data);
      const encoded = btoa(encodeURIComponent(jsonString));
      
      // Create URL with data
      const url = `${window.location.origin}${window.location.pathname}#import=${encoded}`;
      
      console.log('✅ QR Code URL generated:', url);
      console.log('✅ QR Code URL length:', url.length);
      
      // Set data and show modal immediately
      setQrData(url);
      setQrReady(true);
      setShowQR(true);
      toast.success('QR Code ready! Scan with your mobile device.');
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      toast.error('Failed to generate QR code: ' + error.message);
    }
  };

  const importFromQR = () => {
    try {
      // Check if there's import data in the URL hash
      const hash = window.location.hash;
      if (hash.startsWith('#import=')) {
        const encoded = hash.substring(8);
        const jsonString = decodeURIComponent(atob(encoded));
        const data = JSON.parse(jsonString);
        
        // Import data to localStorage
        if (data.tools) localStorage.setItem('nodenest_tools_encrypted', data.tools);
        if (data.storageMode) localStorage.setItem('nodenest_storage_mode', data.storageMode);
        if (data.userId) localStorage.setItem('nodenest_user_id', data.userId);
        if (data.localStorageType) localStorage.setItem('nodenest_local_storage_type', data.localStorageType);
        
        // Clear the hash and reload
        window.location.hash = '';
        window.location.reload();
        
        toast.success('Data imported successfully!');
      } else {
        toast.error('No import data found in URL');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    }
  };

  // Auto-import on mount if hash exists
  React.useEffect(() => {
    if (window.location.hash.startsWith('#import=')) {
      importFromQR();
    }
  }, []);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Button
          onClick={exportLocalStorage}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          Export to Mobile
        </Button>
      </div>

      {showQR && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black bg-opacity-85"
          onClick={() => setShowQR(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 w-full max-w-lg mx-auto my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Scan QR Code</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none p-2 -mt-2 -mr-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            {qrData ? (
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* QR Code Container - CENTERED AND LARGER */}
                <div 
                  className="bg-white p-8 rounded-2xl flex items-center justify-center w-full"
                  style={{ border: '4px solid #8b5cf6', minHeight: '300px' }}
                >
                  <QRCodeCanvas 
                    value={qrData} 
                    size={256}
                    level="M"
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                    style={{ 
                      display: 'block', 
                      width: '256px', 
                      height: '256px',
                      margin: '0 auto'
                    }}
                  />
                </div>
                
                {/* Instructions */}
                <div className="text-center w-full">
                  <p className="text-gray-700 font-semibold text-base mb-2">
                    📱 Scan with your phone camera
                  </p>
                  <p className="text-gray-500 text-sm">
                    Your tools data will be imported automatically
                  </p>
                </div>
                
                {/* Debug info */}
                <details className="text-xs text-gray-400 w-full mt-4">
                  <summary className="cursor-pointer hover:text-gray-600">Debug Info</summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <p>QR Data Length: {qrData.length}</p>
                    <p className="break-all mt-1">QR Data: {qrData.substring(0, 100)}...</p>
                  </div>
                </details>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
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
