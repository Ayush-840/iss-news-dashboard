import React from 'react';
import { RefreshCw, Satellite } from 'lucide-react';
import { motion } from 'framer-motion';
import ISSMap from '../components/ISSMap';
import SpeedChart from '../components/SpeedChart';
import { StatSkeleton } from '../components/Skeletons';

// Floating animation configuration
const floatAnimation = (delay = 0) => ({
  y: [0, -10, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut",
    delay: delay
  }
});

function MiniStat({ label, value, delay }) {
  return (
    <motion.div 
      animate={floatAnimation(delay)}
      className="flex-1 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl"
    >
      <p className="text-[9px] uppercase tracking-[0.2em] text-blue-400 font-black mb-1">{label}</p>
      <p className="text-base font-bold text-white truncate">{value}</p>
    </motion.div>
  );
}

export default function ISSPage({ issDataExternal }) {
  const {
    issLocation, speed, speedHistory, path,
    nearestPlace, isLoading, refresh
  } = issDataExternal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ISS Main Tracking Card */}
      <motion.div 
        animate={floatAnimation(0.2)}
        className="lg:col-span-2 glass-card p-8 flex flex-col gap-8 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Satellite className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">ORBITAL TRACKER</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={refresh} 
              className="text-[10px] font-black tracking-widest px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> RE-SYNC
            </button>
            <div className="text-[10px] font-black tracking-widest px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE TELEMETRY
            </div>
          </div>
        </div>

        {/* Mini Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading && !issLocation ? (
            Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <MiniStat delay={0.1} label="Coordinates" value={issLocation ? `${issLocation.lat.toFixed(3)}, ${issLocation.lon.toFixed(3)}` : '---'} />
              <MiniStat delay={0.3} label="Velocity" value={speed > 0 ? `${Math.round(speed).toLocaleString()} km/h` : '---'} />
              <MiniStat delay={0.5} label="Sector" value={nearestPlace} />
              <MiniStat delay={0.7} label="Sync Points" value={path?.length || 0} />
            </>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 h-[400px] rounded-3xl overflow-hidden border border-white/5 shadow-inner bg-black/20">
          <ISSMap issLocation={issLocation} path={path || []} />
        </div>
      </motion.div>

      {/* Speed Trend Card */}
      <motion.div 
        animate={floatAnimation(0.5)}
        className="glass-card p-8 flex flex-col shadow-2xl"
      >
        <div className="mb-8">
          <p className="text-blue-400 font-black text-[9px] tracking-widest uppercase mb-1">Telemetry History</p>
          <h2 className="text-2xl font-black text-white tracking-tight">VELOCITY TREND</h2>
        </div>
        <div className="flex-1 min-h-[300px]">
          <SpeedChart speedHistory={speedHistory || []} />
        </div>
        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
            Real-time velocity data captured via WhereTheISS API. Fluctuations represent orbital corrections.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
