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

type SummaryChartProps = {
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
  type?: 'bar' | 'doughnut' | 'pie';
  title?: string;
};

const SummaryChart = ({ chartData, type = 'bar', title = 'Overview' }: SummaryChartProps) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        color: '#2c3e50',
        font: {
          size: 18,
        },
      },
    },
  };

  const barOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#5a6e82', stepSize: 1 },
        grid: { color: '#dee2e6' },
      },
      x: {
        ticks: { color: '#5a6e82' },
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

  if (type === 'doughnut' || type === 'pie') {
    return <Doughnut options={doughnutOptions} data={chartData} />;
  }

  return <Bar options={barOptions} data={chartData} />;
};

export default SummaryChart;