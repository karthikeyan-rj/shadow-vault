import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const textColor = '#94a3b8';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: textColor, font: { size: 11, family: 'Inter' } } },
  },
  scales: {
    x: { ticks: { color: textColor }, grid: { color: 'rgba(148,163,184,0.06)' } },
    y: { ticks: { color: textColor, callback: (v) => v >= 1000 ? (v / 1000) + 'K' : v }, grid: { color: 'rgba(148,163,184,0.06)' } },
  },
};

export default function BarChart({ data }) {
  if (!data || !data.labels || data.labels.length === 0) {
    return <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No data</div>;
  }
  return <Bar data={data} options={options} />;
}
