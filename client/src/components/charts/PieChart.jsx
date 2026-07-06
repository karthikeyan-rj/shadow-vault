import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, colors }) {
  if (!data || !data.labels || data.labels.length === 0) {
    return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No data</div>;
  }

  const chartData = {
    labels: data.labels,
    datasets: [{
      data: data.values,
      backgroundColor: colors || ['#f59e0b','#3b82f6','#ef4444','#8b5cf6','#ec4899','#f97316','#6366f1','#64748b'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: '70%',
  };

  return <Doughnut data={chartData} options={options} />;
}
