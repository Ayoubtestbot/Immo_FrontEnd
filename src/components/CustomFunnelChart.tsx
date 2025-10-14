import React from 'react';

interface FunnelChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const CustomFunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data to display</p>;
  }

  const colors = ['#4A90E2', '#50E3C2', '#F5A623', '#F8E71C', '#7ED321'];
  const width = 500;
  const height = 400;
  const segmentHeight = height / data.length;
  const maxValue = Math.max(...data.map(d => d.value));

  const segments = data.map((item, index) => {
    const prevValue = index === 0 ? maxValue : data[index - 1].value;
    const segmentWidth = (item.value / maxValue) * width;
    const prevSegmentWidth = (prevValue / maxValue) * width;
    const x1 = (width - prevSegmentWidth) / 2;
    const x2 = (width - segmentWidth) / 2;
    const y1 = index * segmentHeight;
    const y2 = (index + 1) * segmentHeight;

    const path = `M ${x1},${y1} L ${x1 + prevSegmentWidth},${y1} L ${x2 + segmentWidth},${y2} L ${x2},${y2} Z`;

    const conversionRate = index > 0 ? (item.value / data[index - 1].value) * 100 : 100;

    return {
      ...item,
      path,
      color: colors[index % colors.length],
      labelY: y1 + segmentHeight / 2,
      conversionRate,
    };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      {
        segments.map((segment, index) => (
          <g key={index}>
            <path d={segment.path} fill={segment.color} />
            <text x={width / 2} y={segment.labelY} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="16" fontWeight="bold">
              {segment.name}: {segment.value}
            </text>
            {index > 0 && (
              <text x={width / 2} y={segment.labelY + 20} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="12">
                ({segment.conversionRate.toFixed(1)}%)
              </text>
            )}
          </g>
        ))
      }
    </svg>
  );
};

export default CustomFunnelChart;
