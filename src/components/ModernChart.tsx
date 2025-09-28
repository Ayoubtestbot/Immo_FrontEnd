import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ModernChartProps = {
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
  type?: 'bar' | 'doughnut';
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

  const doughnutOptions = {
    ...baseOptions,
    plugins: {
        ...baseOptions.plugins,
        legend: {
            position: 'right' as const,
        }
    }
  };

  if (type === 'doughnut') {
    return <Doughnut options={doughnutOptions} data={chartData} />;
  }

  return <Bar options={barOptions} data={chartData} />;
};

export default ModernChart;