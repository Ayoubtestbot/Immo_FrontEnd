import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Row, Col, Card } from 'react-bootstrap';

import ModernChart from '@/components/ModernChart';
import KpiCard from '@/components/KpiCard';

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
          '#1A2C49', // Calming blue
          '#4CAF50',  // Soft green
          '#FF7F41', // Amber
          '#6B7280', // Muted gray
          '#DC3545',  // Light red
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
          <KpiCard title="Agences enregistrées" value={totalAgencies} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Abonnements actifs" value={totalSubscriptions} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Prospects totaux" value={totalLeads} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Propriétés gérées" value={totalProperties} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Tickets ouverts" value={totalTickets} />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="card" style={{ minHeight: '400px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <ModernChart chartData={chartData} />
              </div>
            </Card.Body>
          </Card>
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
