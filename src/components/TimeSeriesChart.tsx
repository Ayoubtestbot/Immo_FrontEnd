import { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import ModernChart from './ModernChart';

type TimeSeriesChartProps = {
  title: string;
  data: {
    day: any;
    week: any;
    month: any;
    year: any;
  };
  lineColor?: string; // New prop
};

const TimeSeriesChart = ({ title, data, lineColor = '#1A2C49' }: TimeSeriesChartProps) => {
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const chartDataWithColor = {
    ...data[timePeriod],
    datasets: (data[timePeriod]?.datasets || []).map((dataset: any) => ({
      ...dataset,
      borderColor: lineColor,
      backgroundColor: lineColor, // For fill if enabled
    })),
  };

  return (
    <Card className="card" style={{ minHeight: '400px' }}>
      <Card.Body className="d-flex flex-column h-100">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{title}</h5>
          <div>
            <Button variant={timePeriod === 'day' ? 'primary' : 'outline-secondary'} size="sm" className="me-2" onClick={() => setTimePeriod('day')}>Jour</Button>
            <Button variant={timePeriod === 'week' ? 'primary' : 'outline-secondary'} size="sm" className="me-2" onClick={() => setTimePeriod('week')}>Semaine</Button>
            <Button variant={timePeriod === 'month' ? 'primary' : 'outline-secondary'} size="sm" className="me-2" onClick={() => setTimePeriod('month')}>Mois</Button>
            <Button variant={timePeriod === 'year' ? 'primary' : 'outline-secondary'} size="sm" onClick={() => setTimePeriod('year')}>Année</Button>
          </div>
        </div>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <ModernChart chartData={chartDataWithColor} type="line" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default TimeSeriesChart;
