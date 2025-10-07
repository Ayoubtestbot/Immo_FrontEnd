
import React from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from 'recharts';

interface FunnelChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  const total = data.length > 0 ? data[0].value : 0;

  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
    // Create a "dummy" value to create the funnel shape
    dummy: (total - item.value) / 2,
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ width: '200px', paddingRight: '20px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ marginBottom: '20px', textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{item.value}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>{item.name}</div>
              {index > 0 && (
                <div style={{ fontSize: '14px', color: '#007bff' }}>
                  {((item.value / data[index - 1].value) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, height: '100%' }}>
          <ResponsiveContainer>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 80, left: 80, bottom: 40 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2497E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#54C571" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #ccc',
                }}
                formatter={(value: any, name: any) => (name === 'value' ? [value, 'Leads'] : null)}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                fill="url(#colorUv)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="dummy"
                stroke="none"
                fill="transparent"
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FunnelChart;
