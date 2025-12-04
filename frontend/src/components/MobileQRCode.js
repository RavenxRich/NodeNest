import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Smartphone, X, Download } from 'lucide-react';
import { useStorage } from '../contexts/StorageContext';

const MobileQRCode = () => {
  const [showQR, setShowQR] = useState(false);
  const { tools, storageMode, localStorageType } = useStorage();
  
  // Get the current site URL
  const siteUrl = window.location.origin + window.location.pathname;
  
  // Determine QR code content based on storage mode
  const getQRContent = () => {
    // If using local browser storage, encode the data in the QR code
    if (storageMode === 'local' && localStorageType === 'browser') {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        tools: tools,
        url: siteUrl
      };
      // Create a data URL that the mobile app can parse
      return JSON.stringify(exportData);
    }
    
    // For folder or cloud storage, just share the URL
    return siteUrl;
  };

  const isLocalStorage = storageMode === 'local' && localStorageType === 'browser';
  const qrContent = getQRContent();
  const qrSize = isLocalStorage ? 250 : 200; // Bigger QR for data

  // Download QR code as image
  const downloadQR = () => {
    const svg = document.getElementById('mobile-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = 'nodenest-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <>
      {/* QR Code Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowQR(true)}
        className="gap-2"
        title="Connect Mobile Device"
      >
        <Smartphone className="w-4 h-4" />
        Mobile
      </Button>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="relative glass p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-violet-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white">
                {isLocalStorage ? 'Transfer to Mobile' : 'Connect Mobile Device'}
              </h2>
              
              <p className="text-white/70 text-sm">
                {isLocalStorage 
                  ? 'Scan this QR code to transfer your data to mobile'
                  : 'Scan this QR code to access NodeNest on your mobile device'
                }
              </p>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg inline-block">
                <QRCodeSVG 
                  id="mobile-qr-code"
                  value={qrContent}
                  size={qrSize}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Download Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQR}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Save QR Code
              </Button>

              {/* Instructions */}
              <div className="text-sm text-white/70 border-t border-white/10 pt-4 mt-4">
                <p className="font-semibold mb-2">
                  {isLocalStorage ? '📱 How to import:' : '📱 How to use:'}
                </p>
                
                {isLocalStorage ? (
                  <ol className="text-left space-y-2 text-xs">
                    <li>1. Open NodeNest on your mobile browser</li>
                    <li>2. On landing page, look for "Import from QR"</li>
                    <li>3. Scan this QR code with your phone camera</li>
                    <li>4. Your {tools.length} tool{tools.length !== 1 ? 's' : ''} will be imported!</li>
                  </ol>
                ) : (
                  <ol className="text-left space-y-1 text-xs">
                    <li>1. Open camera app on your phone</li>
                    <li>2. Point at the QR code</li>
                    <li>3. Tap the notification to open</li>
                    <li>4. {storageMode === 'cloud' 
                      ? 'Sign in with same Google account'
                      : 'Select the same folder on mobile'
                    }</li>
                  </ol>
                )}
              </div>

              {/* Info badges */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <div className="text-xs bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full">
                  {storageMode === 'cloud' ? '☁️ Cloud' : 
                   localStorageType === 'browser' ? '💾 Browser' : '📁 Folder'}
                </div>
                <div className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                  {tools.length} tool{tools.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Special note for local storage */}
              {isLocalStorage && (
                <div className="text-xs text-yellow-400/70 bg-yellow-500/10 p-3 rounded-lg mt-4">
                  <p className="font-semibold mb-1">💡 Data Transfer</p>
                  <p>Your tools are encoded in this QR code. When you scan it on mobile, the data will be imported automatically.</p>
                </div>
              )}

              {/* Note for folder storage */}
              {storageMode === 'local' && localStorageType === 'filesystem' && (
                <p className="text-xs text-blue-400/70 mt-4">
                  💡 For folder storage, select the same folder on mobile to sync your data
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default MobileQRCode;
