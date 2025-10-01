import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement, // New import
  PointElement, // New import
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2'; // Added Line import

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement, // New registration
  PointElement, // New registration
);

type ModernChartProps = {
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
      tension?: number;
      fill?: boolean;
      pointRadius?: number;
      pointHoverRadius?: number;
    }[];
  };
  type?: 'bar' | 'doughnut' | 'line';
  title?: string;
};

const ModernChart = ({ chartData, type = 'bar', title }: ModernChartProps) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#34495e', // Dark text color for legend
        },
      },
      title: {
        display: !!title,
        text: title,
        color: '#34495e', // Dark text color for title
        font: {
          size: 18,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker tooltip background
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  const barOptions = {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#34495e' }, // Dark text color for ticks
        grid: { color: '#e0e0e0' }, // Lighter grid lines
      },
      x: {
        ticks: { color: '#34495e' }, // Dark text color for ticks
        grid: { display: false },
      },
    },
  };

  const lineOptions = {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#34495e' },
        grid: { color: '#e0e0e0' },
      },
      x: {
        ticks: { color: '#34495e' },
        grid: { display: false },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Smooth curves
        borderColor: '#1A2C49', // Default line color
        fill: false,
      },
      point: {
        radius: 3,
        backgroundColor: '#1A2C49',
        hoverRadius: 5,
      },
    },
  };

  const doughnutOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        position: 'right' as const,
      },
    },
  };

  if (type === 'doughnut') {
    return <Doughnut options={doughnutOptions} data={chartData} />;
  }

  if (type === 'line') {
    return <Line options={lineOptions} data={chartData} />;
  }

  return <Bar options={barOptions} data={chartData} />;
};

export default ModernChart;