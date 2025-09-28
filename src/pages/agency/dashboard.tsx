import { getSession } from 'next-auth/react';
import type { GetServerSideProps } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import { UserRole, LeadStatus, TicketPriority, User, Lead } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ModernChart from '@/components/ModernChart';
import Link from 'next/link';
import KpiCard from '@/components/KpiCard';
import { getTranslatedUserRole } from '@/utils/userRoleTranslations';
import ViewLeadModal from '@/components/ViewLeadModal';

type LeadWithAssignedTo = Lead & {
  assignedTo: User | null;
};

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
  agencyAgents: (User & { _count?: { assignedLeads: number } })[]; // Updated type
  urgentTasks: {
    newLeads: { id: string; firstName: string; lastName: string }[];
    urgentTickets: { id: string; subject: string }[];
    urgentLeads: { id: string; firstName: string; lastName: string; phone: string | null }[]; // New field
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

  const router = useRouter();

  const overviewChartData = {
    labels: ['Prospects', 'Propriétés', 'Tickets'],
    datasets: [
      {
        label: 'Total',
        data: [totalLeads, totalProperties, totalTickets],
        backgroundColor: ['#1A2C49', '#4CAF50', '#FF7F41'], // Calming blue, soft green, amber
      },
    ],
  };

  const leadsByStatusChartData = {
    labels: leadsByStatus.map(item => item.status),
    datasets: [
      {
        label: 'Répartition des prospects',
        data: leadsByStatus.map(item => item.count),
        backgroundColor: ['#1A2C49', '#4CAF50', '#FF7F41', '#6B7280', '#DC3545'], // New color palette
      },
    ],
  };

  const [showViewLeadModal, setShowViewLeadModal] = useState(false);
  const [showCallLeadModal, setShowCallLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadWithAssignedTo | null>(null);

  const handleOpenViewLeadModal = (lead: LeadWithAssignedTo) => {
    setSelectedLead(lead);
    setShowViewLeadModal(true);
  };

  const handleCloseViewLeadModal = () => {
    setSelectedLead(null);
    setShowViewLeadModal(false);
  };

  const handleOpenCallLeadModal = (lead: LeadWithAssignedTo) => {
    setSelectedLead(lead);
    setShowCallLeadModal(true);
  };

  const handleCloseCallLeadModal = () => {
    setSelectedLead(null);
    setShowCallLeadModal(false);
  };

  return (
    <DashboardLayout>
      {selectedLead && (
        <ViewLeadModal
          show={showViewLeadModal}
          handleClose={handleCloseViewLeadModal}
          lead={selectedLead}
        />
      )}

      {selectedLead && (
        <Modal show={showCallLeadModal} onHide={handleCloseCallLeadModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Appeler le prospect</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            {selectedLead.phone ? (
              <>
                <p className="lead mb-3">Numéro de téléphone:</p>
                <h3><a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a></h3>
              </>
            ) : (
              <p className="lead text-danger">Aucun numéro de téléphone disponible pour ce prospect.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCallLeadModal}>Fermer</Button>
            {selectedLead.phone && (
              <a href={`tel:${selectedLead.phone}`} className="btn btn-primary">Appeler maintenant</a>
            )}
          </Modal.Footer>
        </Modal>
      )}

      <h1 className="h2 mb-4">Tableau de bord</h1>

      <Row>
        <Col md={4} className="mb-4">
          <KpiCard title="Prospects totaux" value={totalLeads} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Prospects créés aujourd'hui" value={leadsToday} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Taux de conversion" value={conversionRate} suffix="%" />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Propriétés gérées" value={totalProperties} />
        </Col>
        <Col md={4} className="mb-4">
          <KpiCard title="Tickets totaux" value={totalTickets} />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={7} className="mb-4">
          <Card className="card" style={{ minHeight: '400px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <h5 className="mb-4">Vue d'ensemble de l'activité</h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <ModernChart chartData={overviewChartData} type="bar" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5} className="mb-4">
          <Card className="card" style={{ minHeight: '400px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <h5 className="mb-4">Répartition des prospects</h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <ModernChart chartData={leadsByStatusChartData} type="doughnut" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <Card className="card" style={{ minHeight: '300px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <Card.Title as="h5" className="mb-4">Tâches Urgentes</Card.Title>
              <div className="flex-grow-1 overflow-auto">
                <h6 className="text-muted mb-2">Prospects urgents</h6>
                {urgentTasks.urgentLeads.length > 0 ? (
                  <ul className="list-unstyled">
                    {urgentTasks.urgentLeads.map(lead => (
                      <li key={lead.id} className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className="status-dot urgent-lead me-2"></span>
                          <Link href={`/agency/leads/${lead.id}`} className="text-decoration-none text-dark fw-bold">
                            {lead.firstName} {lead.lastName}
                          </Link>
                        </div>
                        <div className="d-flex">
                          <Button className="btn-outline-secondary btn-xs me-2" onClick={() => router.push(`/agency/leads/${lead.id}`)}>Voir</Button>
                          <a
                            href={lead.phone ? `tel:${lead.phone}` : '#'}
                            className="btn btn-xs btn-outline-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                            disabled={!lead.phone}
                            onClick={() => handleOpenCallLeadModal(lead as LeadWithAssignedTo)}
                          >
                            Appeler
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Aucun prospect urgent</p>
                )}

                <h6 className="text-muted mt-4 mb-2">Tickets urgents</h6>
                {urgentTasks.urgentTickets.length > 0 ? (
                  <ul className="list-unstyled">
                    {urgentTasks.urgentTickets.map(ticket => (
                      <li key={ticket.id} className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className="status-dot urgent-ticket me-2"></span>
                          <Link href={`/agency/tickets/${ticket.id}`} className="text-decoration-none text-dark fw-bold">
                            {ticket.subject}
                          </Link>
                        </div>
                        <div className="task-actions">
                          <Button size="sm" className="btn-outline-secondary me-2" onClick={() => router.push(`/agency/tickets/${ticket.id}`)}>Voir</Button>
                          <Button size="sm" className="btn-outline-primary" onClick={() => router.push(`/agency/tickets/${ticket.id}`)}>Répondre</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Aucun ticket urgent</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="card" style={{ minHeight: '300px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <Card.Title as="h5" className="mb-4">Activité des agents</Card.Title>
              <div className="flex-grow-1 overflow-auto">
                {agencyAgents.length > 0 ? (
                  <ul className="list-unstyled">
                    {agencyAgents.map(agent => (
                      <li key={agent.id} className="mb-3 p-2 border rounded d-flex align-items-center">
                        <FaUserCircle size={30} className="me-3 text-muted" />
                        <div className="flex-grow-1">
                          <h6 className="mb-0">{agent.name}</h6>
                          <small className="text-muted">{agent.email} - {getTranslatedUserRole(agent.role)}</small>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-info text-dark">{agent._count?.assignedLeads || 0} Prospects</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Aucun agent trouvé pour cette agence.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || (session.user.role !== UserRole.AGENCY_OWNER && session.user.role !== UserRole.AGENCY_MEMBER && session.user.role !== UserRole.AGENCY_SUPER_AGENT)) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const agencyId = session.user.agencyId;
  if (!agencyId) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalLeads, leadsToday, totalProperties, propertiesToday, totalTickets, ticketsToday, convertedLeads, leadsByStatusRaw, agencyAgents, newLeads, urgentTickets, urgentLeads] = await Promise.all([
    prisma.lead.count({ where: { agencyId } }),
    prisma.lead.count({ where: { agencyId, createdAt: { gte: today } } }),
    prisma.property.count({ where: { agencyId } }),
    prisma.property.count({ where: { agencyId, createdAt: { gte: today } } }),
    prisma.ticket.count({ where: { agencyId } }),
    prisma.ticket.count({ where: { agencyId, createdAt: { gte: today } } }),
    prisma.lead.count({ where: { agencyId, status: LeadStatus.CONVERTED } }),
    prisma.lead.groupBy({
      by: ['status'],
      where: { agencyId },
      _count: { status: true },
    }),
    prisma.user.findMany({
      where: { agencyId },
      include: {
        _count: {
          select: { assignedLeads: true },
        },
      },
    }),
    prisma.lead.findMany({
      where: { agencyId, status: LeadStatus.NEW },
      select: { id: true, firstName: true, lastName: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ticket.findMany({
      where: { agencyId, priority: TicketPriority.URGENT },
      select: { id: true, subject: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.findMany({
      where: { agencyId, isUrgent: true }, // Fetch urgent leads
      select: { id: true, firstName: true, lastName: true, phone: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  const leadsByStatus = leadsByStatusRaw.map(item => ({ status: item.status, count: item._count.status }));

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
        urgentLeads: JSON.parse(JSON.stringify(urgentLeads)),
      },
    },
  };
};

export default AgencyDashboard;
