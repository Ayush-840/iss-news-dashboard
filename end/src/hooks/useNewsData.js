import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CACHE_KEY = 'news_cache';
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

const FALLBACK_NEWS = [
  {
    title: "ISS Astronauts Conduct Critical Spacewalk for Solar Array Upgrades",
    description: "Two astronauts exited the International Space Station today to install new iROSA solar arrays, increasing the station's power generation capacity for future research missions.",
    url: "https://www.nasa.gov/iss",
    urlToImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop",
    source: { name: "NASA Mission Control" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "New Earth-Observation Research Arrives via Cargo Dragon",
    description: "The latest SpaceX Cargo Dragon has successfully docked with the ISS, carrying tons of research equipment including new climate monitoring sensors.",
    url: "https://www.nasa.gov/iss",
    urlToImage: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop",
    source: { name: "ESA Hub" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "Global Collaboration: 25 Years of Continuous Human Presence in Space",
    description: "Space agencies worldwide celebrate the quarter-century milestone of permanent human residency aboard the orbiting laboratory.",
    url: "https://www.nasa.gov/iss",
    urlToImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    source: { name: "ISS Chronicle" },
    publishedAt: new Date().toISOString()
  }
];

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

      const articles = (data.articles || []).map(article => ({
        ...article,
        urlToImage: article.image
      }));

      setNews(articles.length > 0 ? articles : FALLBACK_NEWS);
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: articles.length > 0 ? articles : FALLBACK_NEWS,
        query: searchQuery,
        cat: category
      }));

    } catch (err) {
      console.error("News fetch failed:", err);
      setError(err.message || "Failed to fetch news");
      
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        setNews(data);
        toast.info("Showing cached mission logs");
      } else {
        setNews(FALLBACK_NEWS);
        toast.warning("API Unavailable. Loading fallback mission logs.");
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
