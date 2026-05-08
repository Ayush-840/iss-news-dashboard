import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useISSData() {
  const [issLocation, setIssLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [path, setPath] = useState([]);
  const [nearestPlace, setNearestPlace] = useState("Loading...");
  const [astronauts, setAstronauts] = useState({ number: 0, names: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAstronauts = async () => {
    try {
      // open-notify astronauts still useful, using proxy for safety
      let { data } = await axios.get('https://api.allorigins.win/raw?url=' + encodeURIComponent('http://api.open-notify.org/astros.json'));
      if (typeof data === 'string') data = JSON.parse(data);
      setAstronauts({
        number: data.number,
        names: data.people.filter(p => p.craft === 'ISS' || p.craft === 'Tiangong').map(p => p.name)
      });
    } catch (err) {
      console.error("Astronauts fetch failed:", err);
    }
  };

  const fetchISSLocation = useCallback(async (isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      // Switching to WhereTheISS.at for better reliability and HTTPS support
      const { data } = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
      
      const lat = parseFloat(data.latitude);
      const lon = parseFloat(data.longitude);
      const currentTime = data.timestamp;
      const currentSpeed = parseFloat(data.velocity); // wheretheiss provides velocity directly!

      const newPos = { lat, lon, time: currentTime };

      setIssLocation(newPos);
      setPath(prev => {
        const updated = [...prev, [lat, lon]];
        return updated.slice(-50); // Keep last 50 for trajectory
      });

      // Update speed history for chart
      setSpeed(currentSpeed);
      setSpeedHistory(prev => {
        const timeLabel = new Date(currentTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const updated = [...prev, { time: timeLabel, speed: currentSpeed }];
        return updated.slice(-30);
      });

      // Reverse Geocoding
      try {
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
        const place = geoRes.data.display_name || "Over ocean / remote area";
        setNearestPlace(place.split(',').slice(0, 2).join(','));
      } catch {
        setNearestPlace("Over ocean / remote area");
      }

    } catch (err) {
      console.error("ISS Fetch Failed:", err);
      toast.error("Failed to fetch ISS location");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAstronauts();
    fetchISSLocation();

    const interval = setInterval(() => {
      fetchISSLocation();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchISSLocation]);

  return { 
    issLocation, speed, speedHistory, path, 
    nearestPlace, astronauts, isLoading, 
    refresh: () => fetchISSLocation(true) 
  };
}
