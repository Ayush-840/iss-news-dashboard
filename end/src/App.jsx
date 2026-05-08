import React from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useISSData } from './hooks/useISSData';
import { useNewsData } from './hooks/useNewsData';
import ISSPage from './pages/ISSPage';
import NewsPage from './pages/NewsPage';
import Chatbot from './components/Chatbot';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Dashboard() {
  const { darkMode, toggleTheme } = useTheme();
  const issData = useISSData();
  const newsData = useNewsData();

  const chatbotISSData = {
    lat: issData.issLocation?.lat,
    lon: issData.issLocation?.lon,
    speed: issData.speed,
    nearestPlace: issData.nearestPlace,
    pathLength: issData.path?.length,
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <Toaster position="top-right" richColors />
      
      {/* Animated Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-blue-400 font-black text-[10px] tracking-[0.3em] uppercase mb-2">Live Tracking • Global News • AI Intelligence</p>
          <h1 className="text-4xl font-black text-white tracking-tight neon-text uppercase">ISS News Dashboard</h1>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-sm font-bold text-white shadow-2xl hover:bg-white/10 transition-all"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          <span>{darkMode ? 'SOLAR MODE' : 'LUNAR MODE'}</span>
        </motion.button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ISSPage issDataExternal={issData} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <NewsPage newsDataExternal={newsData} />
          </motion.div>
        </AnimatePresence>
      </main>

      <Chatbot issData={chatbotISSData} newsData={newsData.news} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
