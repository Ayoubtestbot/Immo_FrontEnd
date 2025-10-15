import React from 'react';
import CountUp from 'react-countup';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from '@/styles/Dashboard.module.css';

type KpiCardProps = {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  trend?: number;
};

const KpiCard = ({ title, value, prefix, suffix, icon, iconColor, trend }: KpiCardProps) => {
  const renderTrend = () => {
    if (trend === undefined) return <div style={{ height: '24px' }}></div>;

    const trendColor = trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : styles.trendNeutral;
    const TrendIcon = trend > 0 ? FaArrowUp : FaArrowDown;

    return (
      <div className={`${styles.trendIndicator} ${trendColor}`} style={{ height: '24px' }}>
        {trend !== 0 && <TrendIcon />}
        <span>{trend.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className={styles.kpiCard}>
      <div className="d-flex justify-content-between align-items-center">
        <p className="mb-0">{title}</p>
        {icon && <div className={styles.kpiIcon} style={{ color: iconColor }}>{icon}</div>}
      </div>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <h2>
          {prefix}
          <CountUp end={value} duration={2.5} separator="," />
          {suffix}
        </h2>
        {renderTrend()}
      </div>
    </div>
  );
};

export default KpiCard;
