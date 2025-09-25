import { getSession } from 'next-auth/react';
import type { GetServerSideProps } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import { UserRole, LeadStatus, TicketPriority, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';
import styles from '@/styles/Agency.module.css';
import SummaryChart from '@/components/admin/SummaryChart'; // Reusing the admin chart component
import Link from 'next/link';

type AgencyDashboardProps = {
  agencyId: string;
  totalLeads: number;
  leadsToday: number;
  totalProperties: number;
  propertiesToday: number;
  totalTickets: number;
  ticketsToday: number;
  conversionRate: number;
  leadsByStatus: { status: LeadStatus; count: number }[];
  agencyAgents: User[];
  urgentTasks: {
    newLeads: { id: string; firstName: string; lastName: string }[];
    urgentTickets: { id: string; subject: string }[];
  };
};

const AgencyDashboard = (props: AgencyDashboardProps) => {
  const {
    totalLeads,
    leadsToday,
    totalProperties,
    propertiesToday,
    totalTickets,
    ticketsToday,
    conversionRate,
    leadsByStatus,
    agencyAgents,
    urgentTasks,
  } = props;

  const overviewChartData = {
    labels: ['Prospects', 'Propriétés', 'Tickets'],
    datasets: [
      {
        label: 'Total',
        data: [totalLeads, totalProperties, totalTickets],
        backgroundColor: [
          'rgba(0, 123, 255, 0.6)',
          'rgba(40, 167, 69, 0.6)',
          'rgba(255, 193, 7, 0.6)',
        ],
      },
    ],
  };

  const leadsByStatusChartData = {
    labels: leadsByStatus.map(item => item.status),
    datasets: [
      {
        label: 'Répartition des prospects',
        data: leadsByStatus.map(item => item.count),
        backgroundColor: [
          '#007bff', '#6c757d', '#ffc107', '#28a745', '#dc3545'
        ],
      },
    ],
  };

  return (
    <DashboardLayout>
      <h1>Tableau de bord de l'agence</h1>
      <p className="lead" style={{ color: 'var(--text-secondary)' }}>Vue d'ensemble de l'activité de votre agence.</p>

      <Row className="mt-4">
        {/* KPI Cards */}
        <Col md={4} className="mb-4"><div className={styles.statCard}><h2>{totalLeads}</h2><p>Prospects totaux</p></div></Col>
        <Col md={4} className="mb-4"><div className={styles.statCard}><h2>{leadsToday}</h2><p>Prospects créés aujourd'hui</p></div></Col>
        <Col md={4} className="mb-4"><div className={styles.statCard}><h2>{conversionRate.toFixed(2)}%</h2><p>Taux de conversion</p></div></Col>
        <Col md={4} className="mb-4"><div className={styles.statCard}><h2>{totalProperties}</h2><p>Propriétés gérées</p></div></Col>
        <Col md={4} className="mb-4"><div className={styles.statCard}><h2>{propertiesToday}</h2><p>Propriétés ajoutées aujourd'hui</p></div></Col>
        <Col md={4} className="mb-4"><div className={styles.statCard}><h2>{totalTickets}</h2><p>Tickets totaux</p></div></Col>
      </Row>

      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Vue d'ensemble</Card.Title>
              <div className={styles.chartContainer} style={{ height: '300px' }}>
                <SummaryChart chartData={overviewChartData} type="bar" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Répartition des prospects par statut</Card.Title>
              <div className={styles.chartContainer} style={{ height: '300px' }}>
                <SummaryChart chartData={leadsByStatusChartData} type="doughnut" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Tâches Urgentes</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className="fw-bold">Nouveaux prospects</ListGroup.Item>
                {urgentTasks.newLeads.length > 0 ? (
                  urgentTasks.newLeads.map(lead => (
                    <ListGroup.Item key={lead.id}><Link href={`/agency/leads/${lead.id}`}>{lead.firstName} {lead.lastName}</Link></ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>Aucun nouveau prospect</ListGroup.Item>
                )}
                <ListGroup.Item className="fw-bold mt-3">Tickets urgents</ListGroup.Item>
                {urgentTasks.urgentTickets.length > 0 ? (
                  urgentTasks.urgentTickets.map(ticket => (
                    <ListGroup.Item key={ticket.id}><Link href={`/agency/tickets/${ticket.id}`}>{ticket.subject}</Link></ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>Aucun ticket urgent</ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Agents de l'agence</Card.Title>
              <p className="text-muted small">Note: L'efficacité par agent n'est pas encore disponible.</p>
              <ListGroup variant="flush">
                {agencyAgents.map(agent => (
                  <ListGroup.Item key={agent.id}>{agent.name} ({agent.email}) - {agent.role}</ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || (session.user.role !== UserRole.AGENCY_OWNER && session.user.role !== UserRole.AGENCY_MEMBER)) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const agencyId = session.user.agencyId;
  if (!agencyId) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // KPIs
  const [totalLeads, leadsToday, totalProperties, propertiesToday, totalTickets, ticketsToday, convertedLeads] = await Promise.all([
    prisma.lead.count({ where: { agencyId } }),
    prisma.lead.count({ where: { agencyId, createdAt: { gte: today } } }),
    prisma.property.count({ where: { agencyId } }),
    prisma.property.count({ where: { agencyId, createdAt: { gte: today } } }),
    prisma.ticket.count({ where: { agencyId } }),
    prisma.ticket.count({ where: { agencyId, createdAt: { gte: today } } }),
    prisma.lead.count({ where: { agencyId, status: LeadStatus.CONVERTED } }),
  ]);
  
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Leads by status
  const leadsByStatusRaw = await prisma.lead.groupBy({
    by: ['status'],
    where: { agencyId },
    _count: { status: true },
  });
  const leadsByStatus = leadsByStatusRaw.map(item => ({ status: item.status, count: item._count.status }));

  // Agency agents
  const agencyAgents = await prisma.user.findMany({
    where: { agencyId },
  });

  // Urgent Tasks
  const newLeads = await prisma.lead.findMany({
    where: { agencyId, status: LeadStatus.NEW },
    select: { id: true, firstName: true, lastName: true },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  const urgentTickets = await prisma.ticket.findMany({
    where: { agencyId, priority: TicketPriority.URGENT },
    select: { id: true, subject: true },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      agencyId,
      totalLeads,
      leadsToday,
      totalProperties,
      propertiesToday,
      totalTickets,
      ticketsToday,
      conversionRate,
      leadsByStatus: JSON.parse(JSON.stringify(leadsByStatus)),
      agencyAgents: JSON.parse(JSON.stringify(agencyAgents)),
      urgentTasks: {
        newLeads: JSON.parse(JSON.stringify(newLeads)),
        urgentTickets: JSON.parse(JSON.stringify(urgentTickets)),
      },
    },
  };
};

export default AgencyDashboard;