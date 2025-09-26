import type { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import AddLeadModal from '@/components/AddLeadModal';
import UpdateLeadModal from '@/components/UpdateLeadModal';
import AddNoteModal from '@/components/AddNoteModal';
import ImportLeadsModal from '@/components/ImportLeadsModal';
import ViewLeadModal from '@/components/ViewLeadModal';
import LinkPropertyModal from '@/components/LinkPropertyModal';
import CustomDropdownMenu from '@/components/CustomDropdownMenu';
import { prisma } from '@/lib/prisma';
import type { Lead, User, Note, Activity, Property, Prisma } from '@prisma/client';
import { LeadStatus, UserRole } from '@prisma/client'; // Added UserRole
import { Table, Button, Alert, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { leadStatusTranslations, getTranslatedLeadStatus, leadStatusColors } from '@/utils/leadStatusTranslations';
import useDebounce from '@/hooks/useDebounce'; // New import
import { isTrialActive } from '@/lib/subscription';

type LeadWithAssignedTo = Lead & {
  assignedTo: User | null;
  notes: (Note & { author: User })[];
  activities: Activity[];
  properties: Property[]; // New field
};

type LeadsPageProps = {
  leads: LeadWithAssignedTo[];
  agents: User[];
  properties: Property[];
  currentStatus: LeadStatus | 'ALL';
  filterName: string;
  filterAgentId: string;
  isTrialActive: boolean;
};

const LeadsPage = ({ leads, agents, properties, currentStatus, filterName: initialFilterName, filterAgentId: initialFilterAgentId, isTrialActive }: LeadsPageProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showLinkPropertyModal, setShowLinkPropertyModal] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadWithAssignedTo | null>(null);
  const [filterName, setFilterName] = useState(initialFilterName);
  const [filterAgentId, setFilterAgentId] = useState(initialFilterAgentId);
  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const router = useRouter();

  const debouncedFilterName = useDebounce(filterName, 500);

  const refreshData = () => {
    router.replace(router.asPath);
  };

  useEffect(() => {
    const newQuery: Record<string, string> = {};

    if (statusFilter !== 'ALL') {
      newQuery.status = statusFilter;
    }

    // Name Filter
    if (debouncedFilterName) {
      newQuery.name = debouncedFilterName;
    }

    if (filterAgentId !== 'ALL') {
      newQuery.agentId = filterAgentId;
    }

    // Construct current query from router.query for comparison
    const currentQuery: Record<string, string> = {};
    Object.keys(router.query).forEach(key => {
      if (key !== 'agencyId' && router.query[key] !== undefined) {
        currentQuery[key] = String(router.query[key]);
      }
    });

    // Compare newQuery with currentQuery
    const hasChanges = Object.keys(newQuery).length !== Object.keys(currentQuery).length ||
                       Object.keys(newQuery).some(key => newQuery[key] !== currentQuery[key]);

    if (hasChanges) {
      router.push({
        pathname: '/agency/leads',
        query: newQuery,
      });
    }
  }, [statusFilter, debouncedFilterName, filterAgentId, router.query]);

  const handleOpenUpdateModal = (lead: LeadWithAssignedTo) => {
    setEditingLead(lead);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setEditingLead(null);
    setShowUpdateModal(false);
  };

  const handleOpenAddNoteModal = (lead: LeadWithAssignedTo) => {
    setEditingLead(lead);
    setShowAddNoteModal(true);
  };

  const handleCloseAddNoteModal = () => {
    setEditingLead(null);
    setShowAddNoteModal(false);
  };

  const handleOpenViewModal = (lead: LeadWithAssignedTo) => {
    setEditingLead(lead);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setEditingLead(null);
    setShowViewModal(false);
  };

  const handleOpenLinkPropertyModal = (lead: LeadWithAssignedTo) => {
    setEditingLead(lead);
    setShowLinkPropertyModal(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) {
      try {
        const res = await fetch(`/api/leads/${leadId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('Failed to delete lead');
        }
        refreshData();
      } catch (error) {
        console.error(error);
        alert('Error deleting lead');
      }
    }
  };

  return (
    <DashboardLayout>
      {!isTrialActive && (
        <Alert variant="warning">
          Votre période d\'essai a expiré. Vous ne pouvez plus ajouter de nouveaux prospects. Veuillez mettre à niveau votre plan pour continuer.
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des prospects</h1>
        <div>
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="me-2" disabled={!isTrialActive}>
            Ajouter un prospect
          </Button>
          <Button variant="secondary" onClick={() => setShowImportModal(true)} disabled={!isTrialActive}>
            Importer des prospects
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group controlId="statusFilter">
            <Form.Label>Filtrer par statut</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'ALL')}
            >
              <option value="ALL">Tous les statuts</option>
              {Object.values(LeadStatus).map(status => (
                <option key={status} value={status}>{leadStatusTranslations[status]}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="nameFilter">
            <Form.Label>Filtrer par nom</Form.Label>
            <Form.Control
              type="text"
              placeholder="Rechercher par nom"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="agentFilter">
            <Form.Label>Filtrer par agent</Form.Label>
            <Form.Select
              value={filterAgentId}
              onChange={(e) => setFilterAgentId(e.target.value)}
            >
              <option value="ALL">Tous les agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {leads.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Source de trafic</th>
              <th>Statut</th>
              <th>Agent Assigné</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              return (
                <tr key={lead.id} className={!isTrialActive ? 'text-muted' : ''}>
                  <td>{`${lead.firstName} ${lead.lastName}`}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone || '-'}</td>
                  <td>{lead.city || '-'}</td>
                  <td>{lead.trafficSource || '-'}</td>
                  <td>
                    <span className={`badge ${leadStatusColors[lead.status]}`}>{getTranslatedLeadStatus(lead.status)}</span>
                  </td>
                  <td>{lead.assignedTo?.name || <span className="text-muted">Non assigné</span>}</td>
                  <td>
                    <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                      <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${lead.id}`}>
                        Actions
                      </Dropdown.Toggle>
                      <CustomDropdownMenu className="dropdown-menu-fix">
                        <Dropdown.Item onClick={() => handleOpenViewModal(lead)}>Visualiser le prospect</Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => handleOpenUpdateModal(lead)}>Modifier</Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => handleOpenAddNoteModal(lead)}>Ajouter Note</Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => handleOpenLinkPropertyModal(lead)}>Lier une propriété</Dropdown.Item>
                        <Dropdown.Item as="button" className="text-danger" onClick={() => handleDeleteLead(lead.id)}>Supprimer</Dropdown.Item>
                      </CustomDropdownMenu>
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          Aucun prospect trouvé pour ce filtre.
        </Alert>
      )}

      <AddLeadModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onLeadAdded={refreshData}
      />

      {editingLead && (
        <UpdateLeadModal
          show={showUpdateModal}
          handleClose={handleCloseUpdateModal}
          lead={editingLead}
          agents={agents}
          onLeadUpdated={refreshData}
        />
      )}

      {editingLead && (
        <AddNoteModal
          show={showAddNoteModal}
          handleClose={handleCloseAddNoteModal}
          lead={editingLead}
          onNoteAdded={refreshData}
        />
      )}

      <ImportLeadsModal
        show={showImportModal}
        handleClose={() => setShowImportModal(false)}
        onLeadsImported={refreshData}
      />

      {editingLead && (
        <ViewLeadModal
          show={showViewModal}
          handleClose={handleCloseViewModal}
          lead={editingLead}
        />
      )}

      {editingLead && (
        <LinkPropertyModal
          show={showLinkPropertyModal}
          handleClose={() => setShowLinkPropertyModal(false)}
          properties={properties}
          leadId={editingLead.id}
          onPropertyLinked={refreshData}
        />
      )}
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  const { status, name, agentId } = context.query;
  const currentStatus = status && Object.values(LeadStatus).includes(status as LeadStatus) ? status as LeadStatus : 'ALL';
  const filterName = name ? String(name) : '';
  const filterAgentId = agentId ? String(agentId) : 'ALL';

  const whereClause: Prisma.LeadWhereInput = {
    agencyId: session.user.agencyId,
    ...(currentStatus !== 'ALL' && { status: currentStatus }),
    ...(filterName && {
      OR: [
        { firstName: { contains: filterName } },
        { lastName: { contains: filterName } },
      ],
    }),
    ...(filterAgentId !== 'ALL' && { assignedToId: filterAgentId }),
  };

  // Apply RBAC for lead visibility
  if (session.user.role === UserRole.AGENCY_MEMBER) {
    whereClause.assignedToId = session.user.id;
  }

  const [leads, agents, properties, trialIsActive] = await Promise.all([
    prisma.lead.findMany({
      where: whereClause,
      include: {
        assignedTo: true,
        notes: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        properties: true, // New include
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
    }),
    prisma.property.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
    }),
    isTrialActive(session.user.agencyId),
  ]);

  return {
    props: {
      leads: JSON.parse(JSON.stringify(leads)),
      agents: JSON.parse(JSON.stringify(agents)),
      properties: JSON.parse(JSON.stringify(properties)),
      currentStatus,
      filterName,
      filterAgentId,
      isTrialActive: trialIsActive,
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']); // All agency roles can access this page

export default LeadsPage;
