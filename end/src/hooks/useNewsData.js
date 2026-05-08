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
      
      // GNews API structure
      let apiUrl = '';
      if (searchQuery) {
        apiUrl = `https://gnews.io/api/v4/search?q=${searchQuery}&lang=en&country=us&max=10&apikey=${apiKey}`;
      } else {
        apiUrl = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=10&apikey=${apiKey}`;
      }

      const { data } = await axios.get(apiUrl);
      
      if (data.errors) {
        throw new Error(data.errors[0] || "GNews API Error");
      }

      // Map GNews format to our existing UI format
      const articles = (data.articles || []).map(article => ({
        ...article,
        urlToImage: article.image // GNews uses 'image' instead of 'urlToImage'
      }));

      setNews(articles);
      
      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: articles,
        query: searchQuery,
        cat: category
      }));

    } catch (err) {
      console.error("GNews fetch failed:", err);
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
