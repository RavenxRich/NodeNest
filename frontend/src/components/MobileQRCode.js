import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { Upload, Download, QrCode, X } from 'lucide-react';

const MobileQRCode = () => {
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');

  const exportLocalStorage = () => {
    try {
      // Export all nodenest data from localStorage
      const data = {
        tools: localStorage.getItem('nodenest_tools_encrypted'),
        storageMode: localStorage.getItem('nodenest_storage_mode'),
        userId: localStorage.getItem('nodenest_user_id'),
        localStorageType: localStorage.getItem('nodenest_local_storage_type')
      };
      
      const jsonString = JSON.stringify(data);
      const encoded = btoa(encodeURIComponent(jsonString));
      
      // Create URL with data
      const url = `${window.location.origin}${window.location.pathname}#import=${encoded}`;
      
      setQrData(url);
      setShowQR(true);
      toast.success('QR Code generated! Scan with your mobile device.');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowQR(false)}>
          <div className="relative w-full max-w-md mx-auto my-auto">
            <Card className="p-6 bg-white dark:bg-slate-900 w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Scan to Import on Mobile</h3>
                <Button
                  onClick={() => setShowQR(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-center items-center p-8 bg-white dark:bg-slate-800 rounded-lg">
                <QRCodeSVG value={qrData} size={220} level="M" includeMargin={true} />
              </div>
              <p className="text-xs text-muted-foreground dark:text-slate-400 text-center mt-4">
                Scan this QR code with your mobile device's camera to import your tools data
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileQRCode;
