import styles from '../styles/Report.module.css';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  chart?: React.ReactNode;
}

const KpiCard = ({ title, value, icon, chart }: KpiCardProps) => {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiCardIcon}>{icon}</div>
      <div className={styles.kpiCardTitle}>{title}</div>
      <div className={styles.kpiCardValue}>{value}</div>
      {chart}
    </div>
  );
};

export default KpiCard;