import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Card, Row, Col } from 'react-bootstrap';

type AdminDashboardProps = {
  totalAgencies: number;
  totalSubscriptions: number;
  totalLeads: number;
  totalProperties: number;
  totalTickets: number;
};

const AdminDashboard = ({ totalAgencies, totalSubscriptions, totalLeads, totalProperties, totalTickets }: AdminDashboardProps) => {
  return (
    <AdminDashboardLayout>
      <h1>Tableau de bord Administrateur</h1>
      <p className="lead">Vue d'ensemble de la plateforme LeadEstate.</p>

      <Row className="mt-4">
        <Col md={4} className="mb-4">
          <Card className="text-center p-3">
            <Card.Body>
              <h2 className="text-primary">{totalAgencies}</h2>
              <p className="text-muted">Agences enregistrées</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="text-center p-3">
            <Card.Body>
              <h2 className="text-success">{totalSubscriptions}</h2>
              <p className="text-muted">Abonnements actifs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="text-center p-3">
            <Card.Body>
              <h2 className="text-info">{totalLeads}</h2>
              <p className="text-muted">Prospects totaux</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="text-center p-3">
            <Card.Body>
              <h2 className="text-warning">{totalProperties}</h2>
              <p className="text-muted">Propriétés gérées</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="text-center p-3">
            <Card.Body>
              <h2 className="text-danger">{totalTickets}</h2>
              <p className="text-muted">Tickets ouverts</p>
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
    where: { status: 'OPEN' || 'NEW' }, // Assuming 'OPEN' or 'NEW' status
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
