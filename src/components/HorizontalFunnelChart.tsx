import React from 'react';
import styles from './HorizontalFunnelChart.module.css';

interface FunnelChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const HorizontalFunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data to display</p>;
  }

  const colors = ['#4A90E2', '#50E3C2', '#F5A623', '#F8E71C', '#7ED321'];
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={styles.funnelContainer}>
      {data.map((item, index) => {
        const prevValue = index === 0 ? item.value : data[index - 1].value;
        const dropOff = index === 0 ? 0 : ((prevValue - item.value) / prevValue) * 100;
        const segmentWidth = (item.value / maxValue) * 100;

        return (
          <div key={index} className={styles.segment}>
            <div className={styles.segmentInfo}>
              <span className={styles.stageName}>{item.name}</span>
              <span className={styles.stageValue}>{item.value}</span>
              {index > 0 && (
                <span className={styles.dropOff}>(-{dropOff.toFixed(1)}%)</span>
              )}
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${segmentWidth}%`, backgroundColor: colors[index % colors.length] }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalFunnelChart;
