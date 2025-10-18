import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Row, Col, Card, Button } from 'react-bootstrap';

import { FaBuilding, FaCheckCircle, FaUsers, FaHome, FaTicketAlt, FaMoneyBillWave } from 'react-icons/fa';

import ModernChart from '@/components/ModernChart';
import KpiCard from '@/components/KpiCard';

type AdminDashboardProps = {
  totalAgencies: number;
  totalSubscriptions: number;
  totalLeads: number;
  totalProperties: number;
  totalTickets: number;
  totalIncome: number;
  monthlyChartData: any;
  leadsBySourceChartData: any;
  propertiesByTypeChartData: any;
  ticketsByStatusChartData: any;
  leadsChartData: any;
  propertiesChartData: any;
  ticketsChartData: any;
};

import TimeSeriesChart from '@/components/TimeSeriesChart';

const AdminDashboard = ({
  totalAgencies,
  totalSubscriptions,
  totalLeads,
  totalProperties,
  totalTickets,
  totalIncome,
  monthlyChartData,
  leadsBySourceChartData,
  propertiesByTypeChartData,
  ticketsByStatusChartData,
  leadsChartData,
  propertiesChartData,
  ticketsChartData
}: AdminDashboardProps) => {

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
      <p className="lead" style={{ color: 'var(--text-secondary)' }}>Vue d&apos;ensemble de la plateforme LeadEstate.</p>

      <Row className="mt-4">
        <Col md={4} className="mb-4">
          <KpiCard title="Agences enregistrées" value={totalAgencies} icon={<FaBuilding />} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Abonnements actifs" value={totalSubscriptions} icon={<FaCheckCircle />} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Prospects totaux" value={totalLeads} icon={<FaUsers />} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Propriétés gérées" value={totalProperties} icon={<FaHome />} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Tickets ouverts" value={totalTickets} icon={<FaTicketAlt />} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Revenu Total" value={totalIncome} icon={<FaMoneyBillWave />} />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <TimeSeriesChart title="Revenus des Abonnements" data={{day: {}, week: {}, month: monthlyChartData, year: {}}} lineColor="#4CAF50" />
        </Col>
        <Col md={6}>
          <TimeSeriesChart title="Nouveaux Prospects" data={leadsChartData} lineColor="#1A2C49" />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <TimeSeriesChart title="Nouvelles Propriétés" data={propertiesChartData} lineColor="#FF7F41" />
        </Col>
        <Col md={6}>
          <TimeSeriesChart title="Nouveaux Tickets" data={ticketsChartData} lineColor="#6B7280" />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="card" style={{ minHeight: '300px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <h5 className="mb-4">Prospects par Source</h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <ModernChart chartData={leadsBySourceChartData} type="doughnut" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="card" style={{ minHeight: '300px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <h5 className="mb-4">Propriétés par Type</h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <ModernChart chartData={propertiesByTypeChartData} type="doughnut" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="card" style={{ minHeight: '300px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <h5 className="mb-4">Tickets par Statut</h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <ModernChart chartData={ticketsByStatusChartData} type="doughnut" />
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
    const leads = await prisma.lead.findMany();
    const properties = await prisma.property.findMany();
    const tickets = await prisma.ticket.findMany();

  const totalLeads = leads.length;
  const totalProperties = properties.length;
  const totalTickets = tickets.length;

  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'active' },
    include: { plan: true },
  });

  const totalIncome = subscriptions.reduce((acc, sub) => acc + (sub.plan.price || 0), 0);

  const incomeByMonth = subscriptions.reduce((acc, sub) => {
    const month = new Date(sub.startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
    acc[month] = (acc[month] || 0) + (sub.plan.price || 0);
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = {
    labels: Object.keys(incomeByMonth),
    datasets: [
      {
        label: 'Revenu mensuel',
        data: Object.values(incomeByMonth),
        backgroundColor: '#4CAF50',
      },
    ],
  };
  
    const leadsByDay = groupDataByTime(leads, 'createdAt', 'day');
    const leadsByWeek = groupDataByTime(leads, 'createdAt', 'week');
    const leadsByMonth = groupDataByTime(leads, 'createdAt', 'month');
    const leadsByYear = groupDataByTime(leads, 'createdAt', 'year');
  
    const propertiesByDay = groupDataByTime(properties, 'createdAt', 'day');
    const propertiesByWeek = groupDataByTime(properties, 'createdAt', 'week');
    const propertiesByMonth = groupDataByTime(properties, 'createdAt', 'month');
    const propertiesByYear = groupDataByTime(properties, 'createdAt', 'year');
  
    const ticketsByDay = groupDataByTime(tickets, 'createdAt', 'day');
    const ticketsByWeek = groupDataByTime(tickets, 'createdAt', 'week');
    const ticketsByMonth = groupDataByTime(tickets, 'createdAt', 'month');
    const ticketsByYear = groupDataByTime(tickets, 'createdAt', 'year');

  const leadsBySource = await prisma.lead.groupBy({
    by: ['trafficSource'],
    _count: {
      trafficSource: true,
    },
  });

  const leadsBySourceChartData = {
    labels: leadsBySource.map(item => item.trafficSource || 'Unknown'),
    datasets: [
      {
        label: 'Prospects par Source',
        data: leadsBySource.map(item => item._count.trafficSource),
        backgroundColor: ['#1A2C49', '#4CAF50', '#FF7F41', '#6B7280', '#DC3545'],
      },
    ],
  };

  const propertiesByType = await prisma.property.groupBy({
    by: ['type'],
    _count: {
      type: true,
    },
  });

  const propertiesByTypeChartData = {
    labels: propertiesByType.map(item => item.type),
    datasets: [
      {
        label: 'Propriétés par Type',
        data: propertiesByType.map(item => item._count.type),
        backgroundColor: ['#1A2C49', '#4CAF50', '#FF7F41', '#6B7280'],
      },
    ],
  };

  const ticketsByStatus = await prisma.ticket.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const ticketsByStatusChartData = {
    labels: ticketsByStatus.map(item => item.status),
    datasets: [
      {
        label: 'Tickets par Statut',
        data: ticketsByStatus.map(item => item._count.status),
        backgroundColor: ['#1A2C49', '#4CAF50', '#FF7F41', '#6B7280'],
      },
    ],
  };
  
    return {
      props: {
        totalAgencies,
        totalSubscriptions,
        totalLeads,
        totalProperties,
        totalTickets,
        totalIncome,
        monthlyChartData: JSON.parse(JSON.stringify(monthlyChartData)),
        leadsBySourceChartData: JSON.parse(JSON.stringify(leadsBySourceChartData)),
        propertiesByTypeChartData: JSON.parse(JSON.stringify(propertiesByTypeChartData)),
        ticketsByStatusChartData: JSON.parse(JSON.stringify(ticketsByStatusChartData)),
        leadsChartData: {
          day: JSON.parse(JSON.stringify(leadsByDay)),
          week: JSON.parse(JSON.stringify(leadsByWeek)),
          month: JSON.parse(JSON.stringify(leadsByMonth)),
          year: JSON.parse(JSON.stringify(leadsByYear)),
        },
        propertiesChartData: {
          day: JSON.parse(JSON.stringify(propertiesByDay)),
          week: JSON.parse(JSON.stringify(propertiesByWeek)),
          month: JSON.parse(JSON.stringify(propertiesByMonth)),
          year: JSON.parse(JSON.stringify(propertiesByYear)),
        },
        ticketsChartData: {
          day: JSON.parse(JSON.stringify(ticketsByDay)),
          week: JSON.parse(JSON.stringify(ticketsByWeek)),
          month: JSON.parse(JSON.stringify(ticketsByMonth)),
          year: JSON.parse(JSON.stringify(ticketsByYear)),
        },
      },
    };
  };
// Helper function to group data by time period
const groupDataByTime = (data: any[], dateKey: string, period: 'day' | 'week' | 'month' | 'year') => {
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item[dateKey]);
    let key = '';
    if (period === 'day') {
      key = date.toLocaleDateString('fr-CA'); // YYYY-MM-DD
    } else if (period === 'week') {
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      key = weekStart.toLocaleDateString('fr-CA');
    } else if (period === 'month') {
      key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (period === 'year') {
      key = date.getFullYear().toString();
    }
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(grouped),
    datasets: [
      {
        label: `Nombre de prospects par ${period}`,
        data: Object.values(grouped),
        backgroundColor: '#1A2C49',
      },
    ],
  };
};

export default AdminDashboard;
