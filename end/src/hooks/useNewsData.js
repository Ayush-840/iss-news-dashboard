import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function useNewsData() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');

  const fetchNews = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cacheKeyWithParams = `${CACHE_KEY}_${category}_${searchQuery}_${sortBy}`;
      
      if (!forceRefresh) {
        const cachedStr = localStorage.getItem(cacheKeyWithParams);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (Date.now() - cached.timestamp < CACHE_DURATION) {
            setNews(cached.data);
            setIsLoading(false);
            return;
          }
        }
      }

      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) {
        throw new Error("News API key is missing. Please add VITE_NEWS_API_KEY to .env");
      }

      // Handle Event Registry or NewsAPI structure
      let apiUrl = '';
      let isEventRegistry = false;

      if (apiKey.length > 35) { // Event Registry keys are usually longer or we can just try NewsAPI first
         apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}`;
         if (searchQuery) {
            apiUrl = `https://newsapi.org/v2/everything?q=${searchQuery}&sortBy=${sortBy}&apiKey=${apiKey}`;
         }
      } else {
         // Default to newsapi.org
         apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}`;
         if (searchQuery) {
            apiUrl = `https://newsapi.org/v2/everything?q=${searchQuery}&sortBy=${sortBy}&apiKey=${apiKey}`;
         }
      }

      // Use a proxy to bypass CORS restrictions on NewsAPI free tier
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(apiUrl);
      let { data } = await axios.get(proxyUrl);
      
      // Manually parse if proxy returns string
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { throw new Error("Failed to parse news data"); }
      }
      
      let articles = [];
      if (data.articles) {
         articles = data.articles;
      } else if (data.events && data.events.results) {
         // Fallback for Event Registry
         articles = data.events.results.map(ev => ({
            title: ev.title?.eng || ev.title,
            source: { name: ev.source?.title || 'Unknown' },
            author: ev.authors?.[0]?.name || 'Unknown',
            publishedAt: ev.eventDate,
            urlToImage: ev.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image',
            description: ev.summary?.eng || '',
            url: ev.articleUrls?.[0] || '#'
         }));
      } else {
         throw new Error("Invalid response format from News API");
      }

      // Get 10 articles as per requirement
      const topArticles = articles.slice(0, 10);
      
      setNews(topArticles);
      
      localStorage.setItem(cacheKeyWithParams, JSON.stringify({
        timestamp: Date.now(),
        data: topArticles
      }));

      if (forceRefresh) {
        toast.success("News refreshed");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch news");
      toast.error("Failed to load news");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category, searchQuery, sortBy]);

  return { 
    news, 
    isLoading, 
    error, 
    refresh: () => fetchNews(true),
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy
  };
}
