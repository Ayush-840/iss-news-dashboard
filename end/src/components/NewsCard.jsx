import React from 'react';
import { ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function NewsCard({ article, index }) {
  const { title, source, publishedAt, urlToImage, url } = article;

  const dateStr = publishedAt 
    ? format(new Date(publishedAt), 'MMM dd, HH:mm')
    : 'Unknown';

  return (
    <div className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group relative overflow-hidden">
      {/* Background Index Number */}
      <div className="absolute -right-4 -bottom-8 text-8xl font-black text-white/[0.02] pointer-events-none italic">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Thumbnail */}
      <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-900 border border-white/10">
        <img 
          src={urlToImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&auto=format&fit=crop'} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          alt=""
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&auto=format&fit=crop'; }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">
            {source?.name?.split(' ')[0] || 'ORBITAL'}
          </span>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase">
            <Calendar className="w-2.5 h-2.5" />
            {dateStr}
          </div>
        </div>
        
        <h3 className="text-sm font-bold text-gray-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h3>
      </div>

      {/* Action */}
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-3 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-blue-500 transition-all shadow-xl"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
