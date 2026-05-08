import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORIES = ['general', 'technology', 'science', 'health', 'business', 'sports', 'entertainment'];
const COLORS = [
  'rgba(59, 130, 246, 0.85)',
  'rgba(139, 92, 246, 0.85)',
  'rgba(16, 185, 129, 0.85)',
  'rgba(245, 158, 11, 0.85)',
  'rgba(239, 68, 68, 0.85)',
  'rgba(236, 72, 153, 0.85)',
  'rgba(14, 165, 233, 0.85)',
];

export default function NewsDistributionChart({ news, onCategoryClick }) {
  // Count articles per category from localStorage
  const counts = CATEGORIES.map(cat => {
    const key = `news_cache_${cat}__publishedAt`;
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.data?.length || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  // If no cache data, use current news count
  const totalFromCurrent = news.length;
  const hasCacheData = counts.some(c => c > 0);

  const displayCounts = hasCacheData ? counts : CATEGORIES.map((_, i) => (i === 0 ? totalFromCurrent : 0));

  const data = {
    labels: CATEGORIES.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    datasets: [
      {
        data: displayCounts,
        backgroundColor: COLORS,
        borderColor: COLORS.map(c => c.replace('0.85', '1')),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 12,
          font: { size: 11 },
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed} articles`,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        onCategoryClick && onCategoryClick(CATEGORIES[index]);
      }
    },
  };

  return <Doughnut data={data} options={options} />;
}
