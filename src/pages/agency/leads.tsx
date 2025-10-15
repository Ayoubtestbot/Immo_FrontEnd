import type { GetServerSideProps } from 'next';
import { useState, useEffect, useRef } from 'react';
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
import { FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Table, Button, Alert, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { leadStatusTranslations, getTranslatedLeadStatus, leadStatusColors } from '@/utils/leadStatusTranslations';
import useDebounce from '@/hooks/useDebounce'; // New import
import { isTrialActive } from '@/lib/subscription';
import { useSession } from 'next-auth/react'; // New import
import AssignAgentModal from '@/components/AssignAgentModal'; // New import
import BulkStatusChangeModal from '@/components/BulkStatusChangeModal'; // New import
import BulkDeleteModal from '@/components/BulkDeleteModal'; // New import

type LeadWithAssignedTo = Lead & {
  assignedTo: User | null;
  notes: (Note & { author: User })[];
  activities: Activity[];
  properties: Property[]; // New field
  isUrgent: boolean; // New field
};

type LeadsPageProps = {
  leads: LeadWithAssignedTo[];
  agents: User[];
  properties: Property[];
  currentStatus: LeadStatus | 'ALL';
  filterName: string;
  filterAgentId: string;
  isTrialActive: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  agencyCountry: string | null;
};

const LeadsPage = ({ leads, agents, properties, currentStatus, filterName: initialFilterName, filterAgentId: initialFilterAgentId, isTrialActive, currentPage, pageSize, totalPages, agencyCountry }: LeadsPageProps) => {
  const { data: session } = useSession();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showLinkPropertyModal, setShowLinkPropertyModal] = useState(false);
  const [showAssignAgentModal, setShowAssignAgentModal] = useState(false); // New state
  const [showBulkAssignAgentModal, setShowBulkAssignAgentModal] = useState(false); // New state for bulk assign
  const [showBulkStatusChangeModal, setShowBulkStatusChangeModal] = useState(false); // New state for bulk status change
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // New state for bulk delete
  const [editingLead, setEditingLead] = useState<LeadWithAssignedTo | null>(null);
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null); // New state
  const [assigningLeadCurrentAgentId, setAssigningLeadCurrentAgentId] = useState<string | null>(null); // New state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]); // New state for bulk actions
  const [filterName, setFilterName] = useState(initialFilterName);
  const [filterAgentId, setFilterAgentId] = useState(initialFilterAgentId);
  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const router = useRouter();

  const debouncedFilterName = useDebounce(filterName, 500);
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedLeadIds.length > 0 && selectedLeadIds.length < leads.length;
    }
  }, [selectedLeadIds, leads]);

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allLeadIds = leads.map(lead => lead.id);
      setSelectedLeadIds(allLeadIds);
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
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
      if (key !== 'agencyId' && router.query[key] !== undefined && key !== 'page' && key !== 'pageSize') {
        currentQuery[key] = String(router.query[key]);
      }
    });

    // Compare newQuery with currentQuery
    const hasChanges = Object.keys(newQuery).length !== Object.keys(currentQuery).length ||
                       Object.keys(newQuery).some(key => newQuery[key] !== currentQuery[key]);

    if (hasChanges) {
      router.push({
        pathname: '/agency/leads',
        query: { ...newQuery, page: String(currentPage), pageSize: String(pageSize) },
      });
    }
  }, [statusFilter, debouncedFilterName, filterAgentId, router, currentPage, pageSize]);

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

  const handleOpenAssignAgentModal = (lead: LeadWithAssignedTo) => {
    setAssigningLeadId(lead.id);
    setAssigningLeadCurrentAgentId(lead.assignedToId);
    setShowAssignAgentModal(true);
  };

  const handleCloseAssignAgentModal = () => {
    setAssigningLeadId(null);
    setAssigningLeadCurrentAgentId(null);
    setShowAssignAgentModal(false);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Etes-vous sur de vouloir supprimer ce prospect ?')) {
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

  const handleToggleUrgent = async (leadId: string, isUrgent: boolean) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUrgent }),
      });
      if (!res.ok) {
        throw new Error('Failed to update lead urgency');
      }
      refreshData();
    } catch (error) {
      console.error(error);
      alert('Error updating lead urgency');
    }
  };

  const handleExportLeads = async () => {
    try {
      const res = await fetch('/api/agency/leads/export');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to export leads');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prospects.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Erreur lors de l&apos;exportation: ${error.message}`);
    }
  };

  return (
    <DashboardLayout>
      {!isTrialActive && (
        <Alert variant="warning">
          Votre période d&apos;essai a expiré. Vous ne pouvez plus ajouter de nouveaux prospects. Veuillez mettre à niveau votre plan pour continuer.
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Gestion des prospects</h1>
        <div>
          <Button onClick={() => setShowAddModal(true)} className="btn-primary me-2" disabled={!isTrialActive}>
            Ajouter un prospect
          </Button>
          <Button onClick={() => setShowImportModal(true)} className="btn-secondary me-2" disabled={!isTrialActive}>
            Importer des prospects
          </Button>
          {session?.user?.role === UserRole.AGENCY_OWNER && (
            <Button onClick={handleExportLeads} className="btn-info" disabled={!isTrialActive}>
              Exporter les prospects
            </Button>
          )}
        </div>
      </div>

      {selectedLeadIds.length > 0 && (
        <div className="d-flex justify-content-start align-items-center mb-3">
          <span className="me-2">{selectedLeadIds.length} prospect(s) sélectionné(s)</span>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-bulk-actions">
              Actions groupées
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowBulkAssignAgentModal(true)}>Assigner un agent (en masse)</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowBulkStatusChangeModal(true)}>Changer le statut (en masse)</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowBulkDeleteModal(true)}>Supprimer (en masse)</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )}

      <div className="table-responsive-wrapper">
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
        <Table hover responsive>
          <thead>
            <tr>
              <th>
                <Form.Check
                  ref={selectAllRef}
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedLeadIds.length === leads.length && leads.length > 0}
                />
              </th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Source de trafic</th>
              <th>Statut</th>
              <th>Agent Assigné</th>
              <th>Actions</th>
              <th>Urgent</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              return (
                <tr key={lead.id} className={!isTrialActive ? 'text-muted' : ''}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedLeadIds.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                    />
                  </td>
                  <td>{`${lead.firstName} ${lead.lastName}`}</td>
                  <td>
                    {lead.email}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="ms-2">
                        <FaEnvelope style={{ color: '#007bff' }} />
                      </a>
                    )}
                  </td>
                  <td>
                    {lead.phone}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="ms-2">
                        <FaPhone />
                      </a>
                    )}
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone}?text=Bonjour, je vous contacte concernant une propriété.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2"
                      >
                        <FaWhatsapp style={{ color: '#25D366' }} />
                      </a>
                    )}
                  </td>
                  <td>{lead.city || '-'}</td>
                  <td>{lead.trafficSource || '-'}</td>
                  <td>
                    <span className={`badge ${leadStatusColors[lead.status]}`}>{getTranslatedLeadStatus(lead.status)}</span>
                  </td>
                  <td>{lead.assignedTo?.name || <span className="text-muted">Non assigné</span>}</td>
                  <td>
                    <Dropdown align="end">
                                          <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${lead.id}`}>
                                            Actions
                                          </Dropdown.Toggle>
                                          <CustomDropdownMenu className="dropdown-menu-fix">
                                            <Dropdown.Item onClick={() => handleOpenViewModal(lead)}>Visualiser le prospect</Dropdown.Item>
                                            <Dropdown.Item as="button" onClick={() => handleOpenUpdateModal(lead)}>Modifier</Dropdown.Item>
                                            <Dropdown.Item as="button" onClick={() => handleOpenAddNoteModal(lead)}>Ajouter Note</Dropdown.Item>
                                            <Dropdown.Item as="button" onClick={() => handleOpenLinkPropertyModal(lead)}>Lier une propriété</Dropdown.Item>
                                            <Dropdown.Item as="button" onClick={() => handleOpenAssignAgentModal(lead)}>Assigner un agent</Dropdown.Item> {/* New Dropdown Item */}
                                            <Dropdown.Item as="button" className="text-danger" onClick={() => handleDeleteLead(lead.id)}>Supprimer</Dropdown.Item>
                                          </CustomDropdownMenu>                    </Dropdown>
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      id={`urgent-switch-${lead.id}`}
                      checked={lead.isUrgent}
                      onChange={() => handleToggleUrgent(lead.id, !lead.isUrgent)}
                      disabled={!isTrialActive}
                    />
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

      <Row className="mt-4 align-items-center">
        <Col md={4}>
          <Form.Group controlId="pageSizeSelect" className="d-flex align-items-center">
            <Form.Label className="me-2 mb-0">Afficher</Form.Label>
            <Form.Select value={pageSize} onChange={(e) => router.push({ pathname: router.pathname, query: { ...router.query, pageSize: e.target.value, page: 1 } })} style={{ width: 'auto' }}>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Form.Select>
            <Form.Label className="ms-2 mb-0">par page</Form.Label>
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex justify-content-center align-items-center">
          <Button
            variant="outline-primary"
            onClick={() => router.push({ pathname: router.pathname, query: { ...router.query, page: currentPage - 1 } })}
            disabled={currentPage === 1}
            className="me-2"
          >
            Précédent
          </Button>
          <span className="mx-2">Page {currentPage} sur {totalPages}</span>
          <Button
            variant="outline-primary"
            onClick={() => router.push({ pathname: router.pathname, query: { ...router.query, page: currentPage + 1 } })}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </Col>
        <Col md={4}></Col> {/* Empty column for spacing */}
      </Row>

      </div>

      <AddLeadModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onLeadAdded={refreshData}
        agencyCountry={agencyCountry}
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

      {assigningLeadId && (
        <AssignAgentModal
          show={showAssignAgentModal}
          onClose={handleCloseAssignAgentModal}
          leadId={assigningLeadId}
          currentAssignedAgentId={assigningLeadCurrentAgentId}
          onAgentAssigned={refreshData}
        />
      )}

      {/* Bulk Assign Agent Modal */}
      <AssignAgentModal
        show={showBulkAssignAgentModal}
        onClose={() => setShowBulkAssignAgentModal(false)}
        leadId={null} // No single leadId for bulk assign
        currentAssignedAgentId={null} // No single current agent for bulk assign
        selectedLeadIds={selectedLeadIds} // Pass selected lead IDs for bulk action
        onAgentAssigned={() => {
          refreshData();
          setSelectedLeadIds([]); // Clear selection after bulk action
        }}
      />

      {/* Bulk Status Change Modal */}
      <BulkStatusChangeModal
        show={showBulkStatusChangeModal}
        onClose={() => setShowBulkStatusChangeModal(false)}
        selectedLeadIds={selectedLeadIds}
        onLeadsUpdated={() => {
          refreshData();
          setSelectedLeadIds([]); // Clear selection after bulk action
        }}
      />
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  const { status, name, agentId, page = '1', pageSize = '10' } = context.query;
  const currentPage = parseInt(String(page));
  const currentSize = parseInt(String(pageSize));
  const currentStatus = status && Object.values(LeadStatus).includes(status as LeadStatus) ? status as LeadStatus : 'ALL';
  const filterName = name ? String(name) : '';
  const filterAgentId = agentId ? String(agentId) : 'ALL';

  const agencyId = session.user.agencyId;
  if (!agencyId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const whereClause: Prisma.LeadWhereInput = {
    agencyId: agencyId,
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

  const [leads, totalLeadsCount, agents, properties, trialIsActive, agency] = await Promise.all([
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
      skip: (currentPage - 1) * currentSize,
      take: currentSize,
    }),
    prisma.lead.count({ where: whereClause }), // Get total count for pagination
    prisma.user.findMany({
      where: {
        agencyId: agencyId,
      },
    }),
    prisma.property.findMany({
      where: {
        agencyId: agencyId,
      },
    }),
    isTrialActive(agencyId),
    prisma.agency.findUnique({ where: { id: agencyId } }),
  ]);

  const totalPages = Math.ceil(totalLeadsCount / currentSize);

  return {
    props: {
      leads: JSON.parse(JSON.stringify(leads)),
      agents: JSON.parse(JSON.stringify(agents)),
      properties: JSON.parse(JSON.stringify(properties)),
      currentStatus,
      filterName,
      filterAgentId,
      isTrialActive: trialIsActive,
      currentPage,
      pageSize: currentSize,
      totalPages,
      agencyCountry: agency?.country || null,
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']); // All agency roles can access this page

export default LeadsPage;
