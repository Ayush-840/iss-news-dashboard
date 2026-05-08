import React from 'react';
import { RefreshCw, Search, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import NewsCard from '../components/NewsCard';
import { CardSkeleton } from '../components/Skeletons';

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  }
};

export default function NewsPage({ newsDataExternal }) {
  const {
    news, isLoading, refresh, setSearchQuery, sortBy, setSortBy
  } = newsDataExternal;

  const [localSearch, setLocalSearch] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  return (
    <motion.div 
      animate={floatAnimation}
      className="glass-card p-8 shadow-2xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl">
            <Newspaper className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-blue-400 font-black text-[9px] tracking-[0.3em] uppercase mb-1">Deep Space Broadcast</p>
            <h2 className="text-3xl font-black text-white tracking-tight">MISSION LOGS</h2>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </form>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none hover:bg-white/10 transition-colors"
          >
            <option value="publishedAt">LATEST FIRST</option>
            <option value="relevancy">RELEVANCY</option>
            <option value="popularity">POPULARITY</option>
          </select>

          <button 
            onClick={refresh}
            className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          news?.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <NewsCard article={article} index={i} />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
