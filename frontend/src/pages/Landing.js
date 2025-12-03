import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useStorage } from '../contexts/StorageContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { HardDrive, Cloud, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Google OAuth Client ID from environment
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Landing = () => {
  const navigate = useNavigate();
  const { selectStorageMode, storageMode } = useStorage();
  const [showOptions, setShowOptions] = useState(false);
  const [showLocalOptions, setShowLocalOptions] = useState(false);
  const [supportsFileSystem, setSupportsFileSystem] = useState(false);

  // Check browser support for File System Access API
  React.useEffect(() => {
    // Check if File System Access API is available
    // This works in Chrome, Edge, Brave, and other Chromium-based browsers
    const hasAPI = 'showDirectoryPicker' in window;
    console.log('Browser supports File System Access API:', hasAPI);
    console.log('User Agent:', navigator.userAgent);
    setSupportsFileSystem(hasAPI);
  }, []);

  // Check if already has storage mode selected
  React.useEffect(() => {
    if (storageMode) {
      navigate('/dashboard');
    }
  }, [storageMode, navigate]);

  const handleLocalStorage = async (storageType) => {
    console.log('🚀 Starting storage setup:', storageType);
    
    const result = await selectStorageMode('local', null, storageType);
    console.log('📦 Storage setup result:', result);
    
    if (result && result.success) {
      console.log('✅ Navigating to dashboard...');
      setTimeout(() => navigate('/dashboard'), 100);
    } else {
      // Silent fallback to browser storage
      console.log('⚠️ Folder storage failed, using browser storage automatically');
      const fallback = await selectStorageMode('local', null, 'browser');
      if (fallback && fallback.success) {
        setTimeout(() => navigate('/dashboard'), 100);
      }
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      // Decode JWT token to get user info
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      selectStorageMode('cloud', decoded);
      toast.success(`Welcome ${decoded.name || decoded.email}! Using cloud storage.`);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      console.error('Error decoding Google token:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed. Please try again.');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1764350126614-2e529016729c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHxhYnN0cmFjdCUyMG5lYnVsYSUyMHB1cnBsZSUyMGdyYWRpZW50JTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NjQ2OTYwNjl8MA&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 radial-bg" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center glow-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
              NodeNest
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-violet-200 max-w-2xl mx-auto leading-relaxed">
            Your visual AI tools bookmark manager. Save, organize, and access all your favorite AI tools in one beautiful radial interface.
          </p>
        </motion.div>

        {/* Storage Options */}
        {!showOptions ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              data-testid="get-started-btn"
              size="lg"
              onClick={() => setShowOptions(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 glow"
            >
              Get Started
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-6 mt-12"
          >
            {/* Local Storage - Folder Only */}
            <Card data-testid="local-storage-card" className="glass p-8 hover:scale-105 transition-transform duration-300 group">
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                  <HardDrive className="w-10 h-10 text-violet-300" />
                </div>
                <h3 className="text-2xl font-semibold">Folder Storage</h3>
                <p className="text-violet-200 text-sm text-center mb-4">
                  Choose a folder on your computer to save your AI tools data.
                </p>
                
                <div className="w-full space-y-3">
                  <Button
                    onClick={() => handleLocalStorage('filesystem')}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white text-lg py-6"
                  >
                    📁 Start Using NodeNest
                  </Button>
                  <p className="text-xs text-violet-300/70 text-center">
                    ✨ Your data, your folder, your control
                  </p>
                  <p className="text-xs text-violet-300/70 text-center">
                    💾 Saves as: <span className="text-cyan-300 font-mono">nodenest_tools.json</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Cloud Storage */}
            <Card data-testid="cloud-storage-card" className="glass p-8 hover:scale-105 transition-transform duration-300 group">
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                  <Cloud className="w-10 h-10 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-semibold">Cloud Storage</h3>
                <p className="text-violet-200 text-sm text-center mb-4">
                  Sync across devices with Google Sign-In. Access your tools anywhere.
                </p>
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    size="large"
                    text="signin_with"
                    useOneTap={false}
                  />
                </GoogleOAuthProvider>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-white"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <h4 className="font-semibold text-lg mb-1">Visual Organization</h4>
            <p className="text-violet-200 text-sm">Radial layout inspired by orbits</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🤖</div>
            <h4 className="font-semibold text-lg mb-1">AI-Powered</h4>
            <p className="text-violet-200 text-sm">Auto-categorize with Claude</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <h4 className="font-semibold text-lg mb-1">Usage Tracking</h4>
            <p className="text-violet-200 text-sm">See which tools you use most</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
