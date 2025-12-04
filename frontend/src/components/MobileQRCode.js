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
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto'
          }}
          onClick={() => setShowQR(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Scan QR Code</h3>
              <button
                onClick={() => setShowQR(false)}
                style={{ fontSize: '28px', lineHeight: '28px', border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280', padding: '0 8px' }}
              >
                ×
              </button>
            </div>
            
            {qrData ? (
              <>
                <div 
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '3px solid #8b5cf6',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <QRCodeCanvas 
                    value={qrData} 
                    size={260} 
                    level="M"
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                    style={{ display: 'block' }}
                  />
                </div>
                
                <p style={{ textAlign: 'center', color: '#374151', fontWeight: '600', marginTop: '16px', fontSize: '14px' }}>
                  Scan with your phone camera
                </p>
                <p style={{ textAlign: 'center', fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                  Your tools data will be imported automatically
                </p>
                
                {/* Debug info */}
                <details style={{ marginTop: '16px', fontSize: '10px', color: '#999' }}>
                  <summary style={{ cursor: 'pointer' }}>Debug Info</summary>
                  <p>QR Data Length: {qrData.length}</p>
                  <p>QR Data: {qrData.substring(0, 100)}...</p>
                </details>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <p>Loading QR code...</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>qrData is empty</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileQRCode;
