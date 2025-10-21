import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from '../styles/ModernKpiCard.module.css';

type KpiCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
};

const KpiCard = ({ title, value, icon, trend, prefix = '', suffix = '', color }: KpiCardProps) => {
  const getTrendColor = () => {
    if (!trend) return '';
    return trend > 0 ? styles.trendPositive : styles.trendNegative;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? <FaArrowUp /> : <FaArrowDown />;
  };

  return (
    <div className={styles.kpiCard}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper} style={color ? { background: color } : {}}>
          {icon}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={`${styles.trend} ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.value}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
