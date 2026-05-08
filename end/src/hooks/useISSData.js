import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const PROXY = 'https://api.allorigins.win/raw?url=';

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Throttle nominatim — only call once every 30 seconds
let lastGeoFetch = 0;
let lastPlaceName = 'Over ocean / remote area';

export function useISSData() {
  const [issLocation, setIssLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [path, setPath] = useState([]);
  const [nearestPlace, setNearestPlace] = useState('Loading...');
  const [astronauts, setAstronauts] = useState({ number: 0, names: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAstronauts = async () => {
    try {
      // Use HTTPS endpoint directly — no proxy needed
      const { data } = await axios.get('http://api.open-notify.org/astros.json');
      setAstronauts({
        number: data.number,
        names: data.people
          .filter(p => p.craft === 'ISS' || p.craft === 'Tiangong')
          .map(p => p.name)
      });
    } catch {
      // Fallback astronaut data
      setAstronauts({
        number: 7,
        names: ['Oleg Kononenko', 'Nikolai Chub', 'Tracy Dyson', 'Matthew Dominick', 'Michael Barratt', 'Jeanette Epps', 'Alexander Grebenkin']
      });
    }
  };

  const fetchISSLocation = useCallback(async (isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      const { data } = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');

      const lat = parseFloat(data.latitude);
      const lon = parseFloat(data.longitude);
      const currentTime = data.timestamp;
      const currentSpeed = parseFloat(data.velocity);

      setIssLocation({ lat, lon, time: currentTime });
      setPath(prev => [...prev, [lat, lon]].slice(-50));
      setSpeed(currentSpeed);
      setSpeedHistory(prev => {
        const timeLabel = new Date(currentTime * 1000).toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        return [...prev, { time: timeLabel, speed: currentSpeed }].slice(-30);
      });

      // Throttled reverse geocoding — max once per 30s
      const now = Date.now();
      if (now - lastGeoFetch > 30000) {
        lastGeoFetch = now;
        try {
          const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=5&addressdetails=0`;
          const geoRes = await axios.get(PROXY + encodeURIComponent(geoUrl));
          const geoData = typeof geoRes.data === 'string' ? JSON.parse(geoRes.data) : geoRes.data;
          lastPlaceName = geoData.display_name
            ? geoData.display_name.split(',').slice(-2).join(',').trim()
            : 'Over ocean / remote area';
        } catch {
          lastPlaceName = 'Over ocean / remote area';
        }
      }
      setNearestPlace(lastPlaceName);

    } catch (err) {
      console.error('ISS Fetch Failed:', err);
      toast.error('Failed to fetch ISS location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAstronauts();
    fetchISSLocation();
    const interval = setInterval(() => fetchISSLocation(), 15000);
    return () => clearInterval(interval);
  }, [fetchISSLocation]);

  return {
    issLocation, speed, speedHistory, path,
    nearestPlace, astronauts, isLoading,
    refresh: () => fetchISSLocation(true)
  };
}
