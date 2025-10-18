import DashboardLayout from '@/components/DashboardLayout';
import { withAuth } from '@/lib/withAuth';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Row, Col } from 'react-bootstrap';
import KpiCard from '@/components/KpiCard';
import styles from '@/styles/Report.module.css';
import { FiUsers, FiCheckCircle, FiTrendingUp, FiClock, FiHome, FiDollarSign, FiEye } from 'react-icons/fi';
import { leadStatusTranslations } from '@/utils/leadStatusTranslations';
import CustomFunnelChart from '@/components/CustomFunnelChart';

const formatDuration = (milliseconds: number) => {
  if (milliseconds === 0) return 'N/A';
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const ReportPage = ({ data }: { data: any }) => {
  const { data: session, status } = useSession();

  if (status === 'loading' || !data) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  const renderAgentReport = () => {
    const leadConversionData = [
      { name: 'Convertis', value: data.convertedLeads },
      { name: 'Non convertis', value: data.totalLeads - data.convertedLeads },
    ];

    const COLORS = ['#0088FE', '#FF8042'];

    return (
      <div className={styles.reportPage}>
        <div className={styles.reportHeader}>
          <h1>Votre Rapport</h1>
        </div>
        <div className={styles.kpiGrid}>
          <KpiCard title="Nombre total de prospects" value={data.totalLeads} icon={<FiUsers />} />
          <KpiCard title="Prospects convertis" value={data.convertedLeads} icon={<FiCheckCircle />} />
          <KpiCard title="Taux de conversion" value={`${data.conversionRate.toFixed(2)}%`} icon={<FiTrendingUp />} chart={
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={leadConversionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8">
                  {leadConversionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          } />
          <KpiCard title="Temps de réponse moyen" value={formatDuration(data.averageResponseTime)} icon={<FiClock />} />
          <KpiCard title="Nombre de propriétés vendues/louées" value={data.numberOfPropertiesSoldOrRented} icon={<FiHome />} />
          <KpiCard title="Volume des ventes" value={`${data.salesVolume.toLocaleString()} €`} icon={<FiDollarSign />} />
        </div>
        <div className={styles.urgentTasksContainer}>
          <h3>Vos Tâches Urgentes</h3>
          {data.urgentTasks && data.urgentTasks.map((task: any) => (
            <div key={task.id} className="card mb-2">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>{task.firstName} {task.lastName}</div>
                <a href={`/agency/leads?leadId=${task.id}`} className="btn btn-primary btn-sm">Voir</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderManagerReport = () => {
    const overallLeadConversionData = [
      { name: 'Convertis', value: data.totalLeads * (data.overallConversionRate / 100) },
      { name: 'Non convertis', value: data.totalLeads * (1 - (data.overallConversionRate / 100)) },
    ];

    const COLORS = ['#0088FE', '#FF8042'];

    const funnelChartData = data.funnelData.map((item: any) => ({
      name: leadStatusTranslations[item.status] || item.status,
      value: item._count.status,
    }));

    return (
      <div className={styles.reportPage}>
        <div className={styles.reportHeader}>
          <h1>Rapport de l&apos;agence</h1>
        </div>
        <div className={styles.kpiGrid}>
          <KpiCard title="Nombre total de prospects" value={data.totalLeads} icon={<FiUsers />} />
          <KpiCard title="Nombre total de propriétés" value={data.totalProperties} icon={<FiHome />} />
          <KpiCard title="Taux de conversion global" value={`${data.overallConversionRate.toFixed(2)}%`} icon={<FiTrendingUp />} chart={
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={overallLeadConversionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8">
                  {overallLeadConversionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          } />
          <KpiCard title="Temps de réponse moyen global" value={formatDuration(data.overallAverageResponseTime)} icon={<FiClock />} />
          <KpiCard title="Nombre de propriétés vendues/louées" value={data.overallNumberOfPropertiesSoldOrRented} icon={<FiHome />} />
          <KpiCard title="Volume des ventes" value={`${data.overallSalesVolume.toLocaleString()} €`} icon={<FiDollarSign />} />
          <KpiCard title="Nombre de visites" value={data.overallNumberOfShowings} icon={<FiEye />} />
        </div>
        <div className={styles.funnelContainer}>
          <h3>Funnel de conversion</h3>
          <CustomFunnelChart data={funnelChartData} />
        </div>
        <div className="mt-4">
          <h4>KPIs par agent</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.agentKpis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agentName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalLeads" fill="#8884d8" name="Prospects" />
              <Bar dataKey="convertedLeads" fill="#82ca9d" name="Convertis" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {session?.user?.role === 'AGENCY_MEMBER' ? renderAgentReport() : renderManagerReport()}
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/agency/report`, {
    headers: {
      cookie: context.req.headers.cookie || '',
    },
  });
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);

export default ReportPage;
