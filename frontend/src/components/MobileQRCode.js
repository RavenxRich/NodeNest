import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Smartphone, X } from 'lucide-react';

const MobileQRCode = () => {
  const [showQR, setShowQR] = useState(false);
  
  // Get the current site URL
  const siteUrl = window.location.origin + window.location.pathname;

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
          <Card className="relative glass p-8 max-w-md w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-violet-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white">Connect Mobile Device</h2>
              
              <p className="text-white/70 text-sm">
                Scan this QR code with your mobile device to access NodeNest
              </p>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg inline-block">
                <QRCodeSVG 
                  value={siteUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-xs text-white/50 break-all">
                {siteUrl}
              </div>

              <div className="text-sm text-white/70 border-t border-white/10 pt-4 mt-4">
                <p className="font-semibold mb-2">📱 How to use:</p>
                <ol className="text-left space-y-1 text-xs">
                  <li>1. Open camera app on your phone</li>
                  <li>2. Point at the QR code</li>
                  <li>3. Tap the notification to open</li>
                  <li>4. Use the same storage (folder or cloud)</li>
                </ol>
              </div>

              <p className="text-xs text-yellow-400/70 mt-4">
                💡 Note: For folder storage, you'll need to select the same folder on mobile
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default MobileQRCode;
