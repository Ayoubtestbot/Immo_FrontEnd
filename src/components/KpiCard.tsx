import React from 'react';
import CountUp from 'react-countup';
import styles from '@/styles/Dashboard.module.css';

type KpiCardProps = {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
};

const KpiCard = ({ title, value, prefix, suffix }: KpiCardProps) => {
  return (
    <div className={styles.kpiCard}>
      <p>{title}</p>
      <h2>
        {prefix}
        <CountUp end={value} duration={2.5} separator="," />
        {suffix}
      </h2>
    </div>
  );
};

export default KpiCard;
