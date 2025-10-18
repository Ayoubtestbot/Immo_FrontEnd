import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { Prisma, Project } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/withAuth';
import { isTrialActive } from '@/lib/subscription';
import { propertyStatusTranslations } from '@/utils/propertyStatusTranslations';
import { Lead, PropertyType, User } from '@prisma/client';
import { PropertyWithDetails } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';
import { Button, Row, Col, Form, Table, Dropdown, Alert, Card, Accordion } from 'react-bootstrap';
import Select from 'react-select';
import useDebounce from '@/hooks/useDebounce';
import AddPropertyModal from '@/components/AddPropertyModal';
import ViewPropertyModal from '@/components/ViewPropertyModal';
import EditPropertyModal from '@/components/EditPropertyModal';
import LinkLeadModal from '@/components/LinkLeadModal';
import CustomDropdownMenu from '@/components/CustomDropdownMenu';
import AddProjectModal from '@/components/AddProjectModal';
import LinkProjectModal from '@/components/LinkProjectModal';
import AddShowingModal from '@/components/AddShowingModal';
import DuplicatePropertyModal from '@/components/DuplicatePropertyModal';


interface PropertiesPageProps {
  properties: PropertyWithDetails[];
  projects: Project[];
  leads: Lead[];
  agents: User[];
  filterPropertyNumber: string;
  filterCity: string;
  filterType: PropertyType | 'ALL';
  filterMinPrice: string;
  filterMaxPrice: string;
  filterProjectId: string;
  filterEtage: string;
  filterTranche: string;
  isTrialActive: boolean;
  agencyCurrency: string;
}

const PropertiesPage = ({ properties, projects, leads, agents, filterPropertyNumber: initialFilterPropertyNumber, filterCity: initialFilterCity, filterType: initialFilterType, filterMinPrice: initialFilterMinPrice, filterMaxPrice: initialFilterMaxPrice, filterProjectId: initialFilterProjectId, filterEtage: initialFilterEtage, filterTranche: initialFilterTranche, isTrialActive, agencyCurrency }: PropertiesPageProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkProjectModal, setShowLinkProjectModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showLinkLeadModal, setShowLinkLeadModal] = useState(false);
  const [showAddShowingModal, setShowAddShowingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithDetails | null>(null);
  const [clientProperties, setClientProperties] = useState(properties);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filterPropertyNumber, setFilterPropertyNumber] = useState(initialFilterPropertyNumber);
  const [filterCity, setFilterCity] = useState(initialFilterCity);
  const [filterType, setFilterType] = useState(initialFilterType);
  const [filterMinPrice, setFilterMinPrice] = useState(initialFilterMinPrice);
  const [filterMaxPrice, setFilterMaxPrice] = useState(initialFilterMaxPrice);
  const [filterProjectId, setFilterProjectId] = useState(initialFilterProjectId);
  const [filterEtage, setFilterEtage] = useState(initialFilterEtage);
  const [filterTranche, setFilterTranche] = useState(initialFilterTranche);
  const router = useRouter();
  const { data: session } = useSession();

  const debouncedPropertyNumber = useDebounce(filterPropertyNumber, 500);
  const debouncedCity = useDebounce(filterCity, 500);
  const debouncedEtage = useDebounce(filterEtage, 500);
  const debouncedTranche = useDebounce(filterTranche, 500);

  useEffect(() => {
    setClientProperties(properties);
  }, [properties]);

  const refreshData = () => {
    router.replace(router.asPath);
  };

  useEffect(() => {
    const newQuery: Record<string, string> = {};

    if (debouncedPropertyNumber) {
      newQuery.propertyNumber = debouncedPropertyNumber;
    }
    if (debouncedCity) {
      newQuery.city = debouncedCity;
    }
    if (filterType !== 'ALL') {
      newQuery.type = filterType;
    }
    if (filterMinPrice) {
      newQuery.minPrice = filterMinPrice;
    }
    if (filterMaxPrice) {
      newQuery.maxPrice = filterMaxPrice;
    }
    if (filterProjectId) {
      newQuery.projectId = filterProjectId;
    }
    if (debouncedEtage) {
      newQuery.etage = debouncedEtage;
    }
    if (debouncedTranche) {
      newQuery.tranche = debouncedTranche;
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
        pathname: '/agency/properties',
        query: newQuery,
      });
    }
  }, [debouncedPropertyNumber, debouncedCity, filterType, filterMinPrice, filterMaxPrice, filterProjectId, debouncedEtage, debouncedTranche, router]);

  const handleOpenViewModal = (property: PropertyWithDetails) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  const handleOpenEditModal = (property: PropertyWithDetails) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleOpenLinkLeadModal = (property: PropertyWithDetails) => {
    setSelectedProperty(property);
    setShowLinkLeadModal(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Etes-vous sur de vouloir supprimer cette propriété ?')) {
      try {
        const res = await fetch(`/api/properties/${propertyId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('Failed to delete property');
        }
        refreshData();
      } catch (error) {
        console.error(error);
        alert('Error deleting property');
      }
    }
  };

  const cityOptions = Array.from(new Set(clientProperties.map(p => p.city))).map(city => ({ value: city, label: city }));
  const projectOptions = projects.map(project => ({ value: project.id, label: project.name }));



  return (
    <DashboardLayout>
      {!isTrialActive && (
        <Alert variant="warning">
          Votre période d&apos;essai a expiré. Vous ne pouvez plus ajouter de nouvelles propriétés. Veuillez mettre à niveau votre plan pour continuer.
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Gestion des propriétés</h1>
        <div>
          <Button onClick={() => setShowAddProjectModal(true)} className="btn-primary me-2" disabled={!isTrialActive}>
            Ajouter un projet
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="btn-primary me-2" disabled={!isTrialActive}>
            Ajouter une propriété
          </Button>
          <Button variant="outline-primary" className="me-2" disabled={selectedProperties.length === 0} onClick={() => setShowLinkProjectModal(true)}>
            Lier à un projet
          </Button>
          {session?.user?.role !== 'AGENCY_MEMBER' && (
            <Button variant="outline-danger" disabled={selectedProperties.length === 0} onClick={async () => {
              if (window.confirm('Etes-vous sur de vouloir supprimer les propriétés sélectionnées ?')) {
                try {
                  const res = await fetch('/api/properties/bulk-delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ propertyIds: selectedProperties }),
                  });
                  if (!res.ok) {
                    throw new Error('Failed to delete properties');
                  }
                  refreshData();
                  setSelectedProperties([]);
                } catch (error) {
                  console.error(error);
                  alert('Error deleting properties');
                }
              }
            }}>
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Card>
          <Card.Header>Filtres</Card.Header>
          <Card.Body>
            <Row>
              <Col md={2}>
                <Form.Group controlId="propertyNumberFilter">
                  <Form.Label>N° Propriété</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: PR000001"
                    value={filterPropertyNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterPropertyNumber(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="typeFilter">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={filterType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value as PropertyType)}
                  >
                    <option value="ALL">Tous les types</option>
                    {Object.values(PropertyType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="priceRangeFilter">
                  <Form.Label>Prix</Form.Label>
                  <Row>
                    <Col md={6}>
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        value={filterMinPrice}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterMinPrice(e.target.value)}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        value={filterMaxPrice}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterMaxPrice(e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="projectFilter">
                  <Form.Label>Projet</Form.Label>
                  <Select
                    className="form-control"
                    options={projectOptions}
                    onChange={(option: { value: string; label: string } | null) => setFilterProjectId(option ? option.value : '')}
                    isClearable
                    isSearchable
                    placeholder="Projet"
                    value={projectOptions.find(p => p.value === filterProjectId)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="etageFilter">
                  <Form.Label>Etage</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Etage"
                    value={filterEtage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterEtage(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="trancheFilter">
                  <Form.Label>Tranche</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tranche"
                    value={filterTranche}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterTranche(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>

      <div className="table-responsive-wrapper">
      <Table hover responsive>
        <thead>
          <tr>
            <th><Form.Check type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                setSelectedProperties(clientProperties.map((p) => p.id));
              } else {
                setSelectedProperties([]);
              }
            }} /></th>
            <th>Propriété</th>
            <th>Projet</th>
            <th>Adresse</th>
            <th>Ville</th>
            <th>Type</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Etage</th>
            <th>Superficie</th>
            <th>Tranche</th>
            <th>Num Appartement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clientProperties.map((property) => (
            <tr key={property.id} className={!isTrialActive ? 'text-muted' : ''}>
              <td><Form.Check type="checkbox" checked={selectedProperties.includes(property.id)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                  setSelectedProperties([...selectedProperties, property.id]);
                } else {
                  setSelectedProperties(selectedProperties.filter((id) => id !== property.id));
                }
              }} /></td>
              <td>{`PR${String(property.propertyNumber).padStart(6, '0')}`}</td>
              <td>{property.project?.name}</td>
              <td>{property.address}</td>
              <td>{property.city}</td>
              <td>{property.type}</td>
              <td>{property.price}</td>
              <td>{propertyStatusTranslations[property.status]}</td>
              <td>{property.etage}</td>
              <td>{property.superficie}</td>
              <td>{property.tranche}</td>
              <td>{property.numAppartement}</td>
              <td>
                <Dropdown align="end">
                                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                                        Actions
                                      </Dropdown.Toggle>
                                      <CustomDropdownMenu className="dropdown-menu-fix">
                                        <Dropdown.Item onClick={() => handleOpenViewModal(property)}>Visualiser</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleOpenEditModal(property)}>Modifier</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleOpenLinkLeadModal(property)}>Lier à un prospect</Dropdown.Item>
                                        <Dropdown.Item onClick={() => {
                                          setSelectedProperty(property);
                                          setShowDuplicateModal(true);
                                        }}>Dupliquer</Dropdown.Item>
                                        {session?.user?.role !== 'AGENCY_MEMBER' && (
                                          <Dropdown.Item className="text-danger" onClick={() => handleDeleteProperty(property.id)}>Supprimer</Dropdown.Item>
                                        )}
                                      </CustomDropdownMenu>                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      </div>

      <AddPropertyModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onPropertyAdded={refreshData}
      />

      <AddProjectModal
        show={showAddProjectModal}
        handleClose={() => setShowAddProjectModal(false)}
        onProjectAdded={refreshData}
      />

      {selectedProperty && (
        <ViewPropertyModal
          show={showViewModal}
          handleClose={() => setShowViewModal(false)}
          property={selectedProperty}
          agencyCurrency={agencyCurrency}
          onAddShowing={() => setShowAddShowingModal(true)}
        />
      )}

      <DuplicatePropertyModal
        show={showDuplicateModal}
        handleClose={() => setShowDuplicateModal(false)}
        property={selectedProperty}
        onPropertyDuplicated={refreshData}
      />

      {selectedProperty && (
        <EditPropertyModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          property={selectedProperty}
          onPropertyUpdated={refreshData}
        />
      )}

      <LinkProjectModal
        show={showLinkProjectModal}
        handleClose={() => setShowLinkProjectModal(false)}
        projects={projects}
        propertyIds={selectedProperties}
        onProjectLinked={() => {
          refreshData();
          setSelectedProperties([]);
        }}
      />

      <AddShowingModal
        show={showAddShowingModal}
        handleClose={() => setShowAddShowingModal(false)}
        propertyId={selectedProperty?.id || ''}
        agents={agents}
        onShowingAdded={refreshData}
      />

      {selectedProperty && (
        <LinkLeadModal
          show={showLinkLeadModal}
          handleClose={() => setShowLinkLeadModal(false)}
          leads={leads}
          propertyId={selectedProperty.id}
          onLeadLinked={refreshData}
        />
      )}
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  try {
  const { propertyNumber, city, type, minPrice, maxPrice, projectId, etage, tranche } = context.query;
  const filterPropertyNumber = propertyNumber ? String(propertyNumber) : '';
  const filterCity = city ? String(city) : '';
  const filterType = type && Object.values(PropertyType).includes(type as PropertyType) ? type as PropertyType : 'ALL';
  const filterMinPrice = minPrice ? parseFloat(String(minPrice)) : undefined;
  const filterMaxPrice = maxPrice ? parseFloat(String(maxPrice)) : undefined;
  const filterProjectId = projectId ? String(projectId) : '';
  const filterEtage = etage ? parseInt(String(etage)) : undefined;
  const filterTranche = tranche ? String(tranche) : '';

  const agencyId = session.user.agencyId;
  if (!agencyId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const whereClause: Prisma.PropertyWhereInput = {
    agencyId: agencyId,
  };

  if (filterPropertyNumber) {
    const numberPart = filterPropertyNumber.replace('PR', '');
    if (numberPart) {
      // Use a raw query for partial matching on the string representation of propertyNumber
      // This is a workaround for SQLite's limitations with 'contains' on Int fields
      const existingAnd = whereClause.AND;
      whereClause.AND = [
        ...(Array.isArray(existingAnd) ? existingAnd : (existingAnd ? [existingAnd] : [])),
        Prisma.sql`CAST("propertyNumber" AS TEXT) LIKE ${'%' + numberPart + '%'}`,
      ] as any;
    }
  }

  if (filterCity) {
    whereClause.city = { contains: filterCity };
  }
  if (filterType !== 'ALL') {
    whereClause.type = filterType;
  }
  if (filterMinPrice) {
    whereClause.price = { gte: filterMinPrice };
  }
  if (filterMaxPrice) {
    if (typeof whereClause.price === 'object' && whereClause.price !== null) {
      whereClause.price = { ...whereClause.price, lte: filterMaxPrice };
    } else {
      whereClause.price = { lte: filterMaxPrice };
    }
  }
  if (filterProjectId) {
    whereClause.projectId = filterProjectId;
  }
  if (filterEtage) {
    whereClause.etage = filterEtage;
  }
  if (filterTranche) {
    whereClause.tranche = { contains: filterTranche };
  }

  const [properties, projects, leads, agents, trialIsActive, agency] = await Promise.all([
    prisma.property.findMany({
      where: whereClause,
      include: {
        project: true,
        images: true,
        leads: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.project.findMany({
      where: {
        agencyId: agencyId,
      },
    }),
    prisma.lead.findMany({
      where: {
        agencyId: agencyId,
      },
    }),
    prisma.user.findMany({
      where: {
        agencyId: agencyId,
      },
    }),
    isTrialActive(agencyId),
    prisma.agency.findUnique({
        where: { id: agencyId },
        select: { currency: true }
    })
  ]);

  return {
    props: {
      properties: JSON.parse(JSON.stringify(properties)),
      projects: JSON.parse(JSON.stringify(projects)),
      leads: JSON.parse(JSON.stringify(leads)),
      agents: JSON.parse(JSON.stringify(agents)),
      filterPropertyNumber,
      filterCity,
      filterType,
      filterMinPrice: filterMinPrice || '',
      filterMaxPrice: filterMaxPrice || '',
      filterProjectId,
      filterEtage: filterEtage || '',
      filterTranche: filterTranche || '',
      isTrialActive: trialIsActive,
      agencyCurrency: agency?.currency || 'MAD',
    },
  }
} catch (error) {
  console.error(error);
  return {
    props: {
      properties: [],
      projects: [],
      leads: [],
      filterPropertyNumber: '',
      filterCity: '',
      filterType: 'ALL',
      filterMinPrice: '',
      filterMaxPrice: '',
      filterProjectId: '',
      filterEtage: '',
      filterTranche: '',
      isTrialActive: false,
      agencyCurrency: 'MAD',
    },
  };
}
}, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);

export default PropertiesPage;