import { getSession } from 'next-auth/react';
import type { GetServerSideProps } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import { UserRole, LeadStatus, TicketPriority, User, Lead } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Row, Col, Card, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUserCircle, FaPhone, FaSyncAlt, FaCalendarDay, FaUsers, FaPlus, FaChartLine, FaBullseye, FaBuilding, FaTicketAlt, FaEye } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ModernChart from '@/components/ModernChart';
import Link from 'next/link';
import KpiCard from '@/components/KpiCard';
import { getTranslatedUserRole } from '@/utils/userRoleTranslations';
import { LeadWithAssignedTo } from '@/types';
import ViewLeadModal from '@/components/ViewLeadModal';
import HorizontalFunnelChart from '@/components/HorizontalFunnelChart';
import { getTranslatedLeadStatus, leadStatusColors, leadStatusTranslations } from '@/utils/leadStatusTranslations';
import styles from '@/styles/Dashboard.module.css';




type AgencyDashboardProps = {
  userRole: UserRole;
  totalLeads: number;
  totalLeadsTrend: number;
  leadsToday: number;
  leadsTodayTrend: number;
  totalProperties: number;
  propertiesToday: number;
  totalTickets: number;
  ticketsToday: number;
  conversionRate: number;
  conversionRateTrend: number;
  leadsByStatus: { status: LeadStatus; count: number }[];
  agencyAgents?: (User & { _count?: { assignedLeads: number } })[];
  urgentTasks: {
    newLeads: { id: string; firstName: string; lastName: string }[];
    urgentTickets: { id: string; subject: string }[];
    urgentLeads: { id: string; firstName: string; lastName: string; phone: string | null; status: LeadStatus }[]; // New field
  };
  funnelData: { status: LeadStatus; _count: { status: number } }[];
  leadsToContact: number;
  leadsToFollowUp: number;
  appointmentsToday: number;
  leadsContacted: number;
};

const AgencyDashboard = (props: AgencyDashboardProps) => {
  const {
    userRole,
    totalLeads,
    totalLeadsTrend,
    leadsToday,
    leadsTodayTrend,
    totalProperties,
    propertiesToday,
    totalTickets,
    ticketsToday,
    conversionRate,
    conversionRateTrend,
    leadsByStatus,
    agencyAgents,
    urgentTasks,
    funnelData,
    leadsToContact,
    leadsToFollowUp,
    appointmentsToday,
    leadsContacted,
  } = props;

  const funnelStages: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT_SCHEDULED', 'CONVERTED'];
  const funnelChartData = funnelStages.map(stage => {
    const stageData = funnelData.find(d => d.status === stage);
    return {
      name: leadStatusTranslations[stage] || stage,
      value: stageData ? stageData._count.status : 0,
    };
  });

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
    labels: leadsByStatus.map(item => leadStatusTranslations[item.status as LeadStatus] || item.status),
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
  const [selectedUrgentLead, setSelectedUrgentLead] = useState<{ id: string; firstName: string; lastName: string; phone: string | null; status: LeadStatus } | null>(null);


  const handleOpenViewLeadModal = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lead details');
      }
      const leadDetails = await response.json();
      setSelectedLead(leadDetails);
      setShowViewLeadModal(true);
    } catch (error) {
      console.error(error);
      // Handle error, e.g., show a notification
    }
  };

  const handleCloseViewLeadModal = () => {
    setSelectedLead(null);
    setShowViewLeadModal(false);
  };

  const handleOpenCallLeadModal = (lead: LeadWithAssignedTo) => {
    console.log('Opening call lead modal for:', lead);
    setSelectedLead(lead);
    setShowCallLeadModal(true);
  };

  const handleCloseCallLeadModal = () => {
    setSelectedLead(null);
    setShowCallLeadModal(false);
  };

  const handleOpenUrgentLeadCallModal = (lead: { id: string; firstName: string; lastName: string; phone: string | null; status: LeadStatus }) => {
    setSelectedUrgentLead(lead);
    setShowCallLeadModal(true);
  };

  const handleCloseUrgentLeadCallModal = () => {
    setSelectedUrgentLead(null);
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

      {(selectedLead || selectedUrgentLead) && (
        <Modal show={showCallLeadModal} onHide={selectedLead ? handleCloseCallLeadModal : handleCloseUrgentLeadCallModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Appeler le prospect</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            {(selectedLead?.phone || selectedUrgentLead?.phone) ? (
              <>
                <p className="lead mb-3">Numéro de téléphone:</p>
                <h3><a href={`tel:${selectedLead?.phone || selectedUrgentLead?.phone}`}>{selectedLead?.phone || selectedUrgentLead?.phone}</a></h3>
              </>
            ) : (
              <p className="lead text-danger">Aucun numéro de téléphone disponible pour ce prospect.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={selectedLead ? handleCloseCallLeadModal : handleCloseUrgentLeadCallModal}>Fermer</Button>
            {(selectedLead?.phone || selectedUrgentLead?.phone) && (
              <a href={`tel:${selectedLead?.phone || selectedUrgentLead?.phone}`} className="btn btn-primary">Appeler maintenant</a>
            )}
          </Modal.Footer>
        </Modal>
      )}

      <h1 className="h2 mb-4">Tableau de bord</h1>

      <Row>
        {userRole === UserRole.AGENCY_OWNER && (
                              <>
                                <Col md={4} className="mb-4">
                                  <KpiCard title="Prospects totaux (Agence)" value={totalLeads} icon={<FaBullseye />} />
                                </Col>
                                <Col md={4} className="mb-4">
                                  <KpiCard title="Prospects à contacter" value={leadsToContact} icon={<FaPhone />} />
                                </Col>
                                <Col md={4} className="mb-4">
                                  <KpiCard title="Prospects contactés" value={leadsContacted} icon={<FaUsers />} />
                                </Col>
                                <Col md={4} className="mb-4">
                                  <KpiCard title="Nouveaux prospects (Aujourd'hui)" value={leadsToday} icon={<FaPlus />} />
                                </Col>
                                <Col md={4} className="mb-4">
                                  <KpiCard title="Taux de conversion (Agence)" value={conversionRate} icon={<FaChartLine />} />
                                </Col>
                                <Col md={4} className="mb-4">
                                  <KpiCard title="Propriétés gérées" value={totalProperties} icon={<FaBuilding />} />
                                </Col>
                              </>        )}
        {(userRole === UserRole.AGENCY_MEMBER || userRole === UserRole.AGENCY_SUPER_AGENT) && (
          <>
            <Col md={4} className="mb-4">
              <KpiCard title={userRole === UserRole.AGENCY_MEMBER ? "Mes prospects à contacter" : "Prospects à contacter"} value={leadsToContact} icon={<FaPhone />} />
            </Col>
            <Col md={4} className="mb-4">
              <KpiCard title={userRole === UserRole.AGENCY_MEMBER ? "Mes prospects à relancer" : "Prospects à relancer"} value={leadsToFollowUp} icon={<FaSyncAlt />} />
            </Col>
            <Col md={4} className="mb-4">
              <KpiCard title={userRole === UserRole.AGENCY_MEMBER ? "Mes RV aujourd'hui" : "RV aujourd'hui"} value={appointmentsToday} icon={<FaCalendarDay />} />
            </Col>
             <Col md={4} className="mb-4">
              <KpiCard title={userRole === UserRole.AGENCY_MEMBER ? "Mes prospects" : "Prospects"} value={totalLeads} icon={<FaUsers />} />
            </Col>
            <Col md={4} className="mb-4">
              <KpiCard title="Nouveaux prospects (Aujourd'hui)" value={leadsToday} icon={<FaPlus />} />
            </Col>
            <Col md={4} className="mb-4">
              <KpiCard title={userRole === UserRole.AGENCY_MEMBER ? "Mon taux de conversion" : "Taux de conversion"} value={conversionRate} icon={<FaChartLine />} />
            </Col>
          </>
        )}
      </Row>

      <Row className="mt-4">
        <Col md={userRole !== UserRole.AGENCY_MEMBER ? 6 : 12} className="mb-4">
          <Card className="card">
            <Card.Body className="d-flex flex-column h-100">
              <div className="flex-grow-1">
                <h6 className="text-muted mb-2">Prospects urgents</h6>
                {urgentTasks.urgentLeads.length > 0 ? (
                  <Row>
                    {urgentTasks.urgentLeads.map(lead => (
                      <Col md={6} key={lead.id}>
                        <Card className={`mb-3 ${styles.urgentTaskCard} ${styles.smallUrgentTaskCard}`}>
                          <Card.Body>
                            <div className="d-flex">
                              <div className={styles.taskCheckbox}></div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <Card.Title className="mb-1">{lead.firstName} {lead.lastName}</Card.Title>
                                    <Card.Subtitle className="mb-0 text-muted">
                                      <span className={`badge ${leadStatusColors[lead.status]}`}>
                                        {getTranslatedLeadStatus(lead.status)}
                                      </span>
                                    </Card.Subtitle>
                                  </div>
                                  <div className="d-flex">
                                      <Button variant="outline-secondary" className="btn-sm me-2" onClick={() => handleOpenViewLeadModal(lead.id)}>
                                        <FaEye />
                                      </Button>
                                    <OverlayTrigger overlay={<Tooltip id={`tooltip-call-${lead.id}`}>Appeler</Tooltip>}>
                                      <Button
                                        variant="outline-primary"
                                        className="btn-sm"
                                        disabled={!lead.phone}
                                        onClick={() => handleOpenUrgentLeadCallModal(lead)}
                                      >
                                        <FaPhone />
                                      </Button>
                                    </OverlayTrigger>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <p className="text-muted">Aucun prospect urgent</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        {userRole !== UserRole.AGENCY_MEMBER && agencyAgents && (
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
        )}
      </Row>

      <Row className="mt-4">
        {userRole !== UserRole.AGENCY_MEMBER && (
          <Col lg={12} className="mb-4">
            <Card className="card" style={{ minHeight: '400px' }}>
              <Card.Body className="d-flex flex-column h-100">
                <h5 className="mb-4">Vue d&apos;ensemble de l&apos;activité</h5>
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                  <ModernChart chartData={overviewChartData} type="bar" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      <Row className="mt-4 d-flex">
        <Col lg={6} className="mb-4">
          <Card className="card h-100" style={{ minHeight: '400px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <h5 className="mb-4">Répartition des prospects</h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <ModernChart chartData={leadsByStatusChartData} type="doughnut" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="card h-100" style={{ minHeight: '400px' }}>
            <Card.Body className="d-flex flex-column h-100">
              <h5 className="mb-4">Conversion Funnel</h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <HorizontalFunnelChart data={funnelChartData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

        <Row className="mt-4">
          <Col md={12} className="mb-4">
            <Card className="card">
              <Card.Body>
                <h6 className="text-muted mb-2">Tickets urgents</h6>
                {urgentTasks.urgentTickets.length > 0 ? (
                  <Row>
                    {urgentTasks.urgentTickets.map(ticket => (
                      <Col md={6} key={ticket.id}>
                        <Card className={`mb-3 ${styles.urgentTaskCard} ${styles.smallUrgentTaskCard}`}>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <span className="status-dot urgent-ticket me-2"></span>
                                <Card.Title className="mb-1 d-inline-block">{ticket.subject}</Card.Title>
                              </div>
                              <div className="task-actions">
                                <Button size="sm" className="btn-outline-secondary me-2" onClick={() => router.push(`/agency/tickets/${ticket.id}`)}>Voir</Button>
                                <Button size="sm" className="btn-outline-primary" onClick={() => router.push(`/agency/tickets/${ticket.id}`)}>Répondre</Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <p className="text-muted">Aucun ticket urgent</p>
                )}
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

  const { user } = session;
  const agencyId = user.agencyId;
  if (!agencyId) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isAgent = user.role === UserRole.AGENCY_MEMBER;
  const baseWhere = {
    agencyId,
    ...(isAgent && { assignedToId: user.id }),
  };

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [totalLeads, leadsToday, leadsYesterday, totalProperties, propertiesToday, totalTickets, ticketsToday, convertedLeads, convertedLeadsYesterday, totalLeadsYesterday, leadsByStatusRaw, agencyAgents, urgentTickets, urgentLeads, funnelData, leadsToContact, leadsToFollowUp, appointmentsToday, leadsContacted] = await Promise.all([
    prisma.lead.count({ where: baseWhere }),
    prisma.lead.count({ where: { ...baseWhere, createdAt: { gte: today } } }),
    prisma.lead.count({ where: { ...baseWhere, createdAt: { gte: yesterday, lt: today } } }),
    isAgent ? Promise.resolve(0) : prisma.property.count({ where: { agencyId } }),
    isAgent ? Promise.resolve(0) : prisma.property.count({ where: { agencyId, createdAt: { gte: today } } }),
    isAgent ? Promise.resolve(0) : prisma.ticket.count({ where: { agencyId } }),
    isAgent ? Promise.resolve(0) : prisma.ticket.count({ where: { agencyId, createdAt: { gte: today } } }),
    prisma.lead.count({ where: { ...baseWhere, status: LeadStatus.CONVERTED } }),
    prisma.lead.count({ where: { ...baseWhere, status: LeadStatus.CONVERTED, updatedAt: { lt: today } } }),
    prisma.lead.count({ where: { ...baseWhere, createdAt: { lt: today } } }),
    prisma.lead.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { status: true },
    }),
    isAgent ? Promise.resolve([]) : prisma.user.findMany({
      where: { agencyId },
      include: { _count: { select: { assignedLeads: true } } },
    }),
    prisma.ticket.findMany({
      where: { agencyId, priority: TicketPriority.URGENT, status: { not: 'CLOSED' } },
      select: { id: true, subject: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.lead.findMany({
      where: { ...baseWhere, isUrgent: true, status: { not: LeadStatus.CONVERTED } },
      select: { id: true, firstName: true, lastName: true, phone: true, status: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.lead.groupBy({
      by: ['status'],
      where: {
        ...baseWhere,
        status: {
          in: ['NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT_SCHEDULED', 'CONVERTED'],
        },
      },
      _count: {
        status: true,
      },
    }),
    prisma.lead.count({ where: { ...baseWhere, status: LeadStatus.NEW } }),
    prisma.lead.count({ where: { ...baseWhere, status: LeadStatus.FOLLOW_UP } }),
    prisma.lead.count({ where: { ...baseWhere, appointmentDate: { gte: today, lt: tomorrow } } }),
    prisma.lead.count({ where: { ...baseWhere, status: LeadStatus.CONTACTED } })
  ]);

  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  const conversionRateYesterday = totalLeadsYesterday > 0 ? (convertedLeadsYesterday / totalLeadsYesterday) * 100 : 0;
  const conversionRateTrend = conversionRateYesterday > 0 ? ((conversionRate - conversionRateYesterday) / conversionRateYesterday) * 100 : conversionRate > 0 ? 100 : 0;

  const leadsByStatus = leadsByStatusRaw.map(item => ({ status: item.status, count: item._count.status }));

  const leadsTodayTrend = leadsYesterday > 0 ? ((leadsToday - leadsYesterday) / leadsYesterday) * 100 : leadsToday > 0 ? 100 : 0;

  const totalLeadsTrend = totalLeadsYesterday > 0 ? ((totalLeads - totalLeadsYesterday) / totalLeadsYesterday) * 100 : totalLeads > 0 ? 100 : 0;

  return {
    props: {
      userRole: user.role,
      totalLeads,
      totalLeadsTrend: parseFloat(totalLeadsTrend.toFixed(2)),
      leadsToday,
      leadsTodayTrend: parseFloat(leadsTodayTrend.toFixed(2)),
      totalProperties,
      propertiesToday,
      totalTickets,
      ticketsToday,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      conversionRateTrend: parseFloat(conversionRateTrend.toFixed(2)),
      leadsByStatus: JSON.parse(JSON.stringify(leadsByStatus)),
      agencyAgents: JSON.parse(JSON.stringify(agencyAgents)),
      urgentTasks: {
        newLeads: [], // This was seemingly unused, so clarifying its state
        urgentTickets: JSON.parse(JSON.stringify(urgentTickets)),
        urgentLeads: JSON.parse(JSON.stringify(urgentLeads)),
      },
      funnelData: JSON.parse(JSON.stringify(funnelData)),
      leadsToContact,
      leadsToFollowUp,
      appointmentsToday,
      leadsContacted,
    },
  };
};

export default AgencyDashboard;
