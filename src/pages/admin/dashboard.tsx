import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Row, Col } from 'react-bootstrap';
import styles from '@/styles/Admin.module.css';
import SummaryChart from '@/components/admin/SummaryChart';

type AdminDashboardProps = {
  totalAgencies: number;
  totalSubscriptions: number;
  totalLeads: number;
  totalProperties: number;
  totalTickets: number;
};

const AdminDashboard = ({ totalAgencies, totalSubscriptions, totalLeads, totalProperties, totalTickets }: AdminDashboardProps) => {

  const chartData = {
    labels: ['Agences', 'Abonnements', 'Prospects', 'Propriétés', 'Tickets'],
    datasets: [
      {
        label: 'Total',
        data: [totalAgencies, totalSubscriptions, totalLeads, totalProperties, totalTickets],
        backgroundColor: [
          'rgba(88, 166, 255, 0.6)', // Agencies
          'rgba(46, 160, 67, 0.6)',  // Subscriptions
          'rgba(29, 155, 240, 0.6)', // Leads
          'rgba(247, 202, 24, 0.6)', // Properties
          'rgba(249, 24, 128, 0.6)',  // Tickets
        ],
      },
    ],
  };

  return (
    <AdminDashboardLayout>
      <h1>Tableau de bord Administrateur</h1>
      <p className="lead" style={{ color: 'var(--text-secondary)' }}>Vue d'ensemble de la plateforme LeadEstate.</p>

      <Row className="mt-4">
        <Col md={4} className="mb-4">
          <div className={styles.statCard}>
            <h2 style={{ color: 'var(--primary-color)' }}>{totalAgencies}</h2>
            <p>Agences enregistrées</p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className={styles.statCard}>
            <h2 style={{ color: '#2ea043' }}>{totalSubscriptions}</h2>
            <p>Abonnements actifs</p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className={styles.statCard}>
            <h2 style={{ color: '#1d9bf0' }}>{totalLeads}</h2>
            <p>Prospects totaux</p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className={styles.statCard}>
            <h2 style={{ color: '#f7ca18' }}>{totalProperties}</h2>
            <p>Propriétés gérées</p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className={styles.statCard}>
            <h2 style={{ color: '#f91880' }}>{totalTickets}</h2>
            <p>Tickets ouverts</p>
          </div>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <div className={styles.chartContainer} style={{ height: '400px' }}>
            <SummaryChart chartData={chartData} />
          </div>
        </Col>
      </Row>
    </AdminDashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || session.user?.role !== UserRole.ADMIN) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Fetch overview data
  const totalAgencies = await prisma.agency.count();
  const totalSubscriptions = await prisma.subscription.count({
    where: { status: 'active' }, // Assuming 'active' status
  });
  const totalLeads = await prisma.lead.count();
  const totalProperties = await prisma.property.count();
  const totalTickets = await prisma.ticket.count({
    where: { status: { in: ['OPEN', 'NEW'] } },
  });

  return {
    props: {
      totalAgencies,
      totalSubscriptions,
      totalLeads,
      totalProperties,
      totalTickets,
    },
  };
};

export default AdminDashboard;
