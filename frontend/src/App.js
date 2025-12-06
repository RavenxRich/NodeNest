import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import Systems from './pages/Systems';
import { StorageProvider } from './contexts/StorageContext';
import { Toaster } from './components/ui/sonner';
import '@/App.css';

function App() {
  // Use basename only for production (GitHub Pages)
  const basename = process.env.NODE_ENV === 'production' ? '/NodeNest' : '';
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <StorageProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/systems" element={<Systems />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </StorageProvider>
    </ThemeProvider>
  );
}

export default App;
