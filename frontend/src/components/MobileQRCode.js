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
      setIsGenerating(true);
      
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
      
      // Set data first, then show modal after a tick
      setQrData(url);
      setTimeout(() => {
        setShowQR(true);
        setIsGenerating(false);
        toast.success('QR Code ready! Scan with your mobile device.');
      }, 100);
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      setIsGenerating(false);
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

      {showQR && qrData && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowQR(false)}
        >
          <div 
            className="relative w-full max-w-lg mx-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Scan QR Code</h3>
                <button
                  onClick={() => setShowQR(false)}
                  className="text-gray-500 hover:text-gray-700"
                  style={{ fontSize: '24px', lineHeight: '24px' }}
                >
                  ×
                </button>
              </div>
              
              <div 
                className="flex justify-center items-center"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  padding: '32px',
                  borderRadius: '12px',
                  border: '4px solid #8b5cf6'
                }}
              >
                <QRCodeCanvas 
                  value={qrData} 
                  size={280} 
                  level="M"
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>
              
              <p className="text-center text-gray-700 font-medium mt-6">
                Scan with your phone camera
              </p>
              <p className="text-center text-sm text-gray-500 mt-2">
                Your tools data will be imported automatically
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileQRCode;
