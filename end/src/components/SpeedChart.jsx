import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SpeedChart({ speedHistory }) {
  const isDark = document.documentElement.classList.contains('dark');

  const data = {
    labels: speedHistory.map(s => s.time),
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: speedHistory.map(s => Math.round(s.speed)),
        fill: true,
        borderColor: '#EF4444', // Red-500 matching reference
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        tension: 0.1, // Less tension for the jagged look in reference
        pointRadius: 0, // No points in reference
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 20,
          boxHeight: 10,
          font: { size: 10, weight: 'bold' },
          color: isDark ? '#9ca3af' : '#6b7280',
        }
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 8 },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        display: true,
        position: 'left',
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#9ca3af',
          font: { size: 9 },
          stepSize: 100,
        },
        min: 24500,
        max: 25100,
      },
    },
  };

  if (speedHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p className="text-xs font-bold tracking-widest uppercase">Waiting for telemetry...</p>
      </div>
    );
  }

  return <Line data={data} options={options} />;
}
