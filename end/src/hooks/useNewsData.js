import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CACHE_KEY = 'news_cache';
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

export function useNewsData() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      
      // If there is a search query, use 'everything' endpoint
      // If not, use 'top-headlines' with 'sources=bbc-news' as requested
      let apiUrl = '';
      if (searchQuery) {
        apiUrl = `https://newsapi.org/v2/everything?q=${searchQuery}&sortBy=${sortBy}&apiKey=${apiKey}`;
      } else {
        apiUrl = `https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=${apiKey}`;
      }

      const { data } = await axios.get(apiUrl);
      
      if (data.status === 'error') {
        throw new Error(data.message || "News API Error");
      }

      let articles = data.articles || [];
      
      // Basic cleaning: remove articles with [Removed] content
      articles = articles.filter(a => a.title && a.title !== '[Removed]');

      setNews(articles);
      
      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: articles,
        query: searchQuery,
        cat: category
      }));

    } catch (err) {
      console.error("News fetch failed:", err);
      setError(err.message || "Failed to fetch news");
      
      // Load from cache if offline or error
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        setNews(data);
        toast.info("Showing cached news articles");
      } else {
        toast.error("Failed to load news articles");
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, sortBy, category]);

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data, query, cat } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME && query === searchQuery && cat === category) {
        setNews(data);
        setIsLoading(false);
        return;
      }
    }
    
    fetchNews();
  }, [fetchNews, searchQuery, category]);

  return {
    news,
    isLoading,
    error,
    refresh: fetchNews,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy
  };
}
