import type { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import AddPropertyModal from '@/components/AddPropertyModal';
import ViewPropertyModal from '@/components/ViewPropertyModal';
import EditPropertyModal from '@/components/EditPropertyModal';
import LinkLeadModal from '@/components/LinkLeadModal';
import { prisma } from '@/lib/prisma';
import type { Property, Image, Lead, Prisma } from '@prisma/client';
import { PropertyType } from '@prisma/client';
import { Table, Button, Dropdown, Form, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/router';
import DynamicMap from '@/components/DynamicMap';
import CustomDropdownMenu from '@/components/CustomDropdownMenu';
import useDebounce from '@/hooks/useDebounce'; // New import
import { isTrialActive } from '@/lib/subscription';

type PropertyWithDetails = Property & {
  images: Image[];
  leads: Lead[];
};

type PropertiesPageProps = {
  properties: PropertyWithDetails[];
  leads: Lead[];
  filterPropertyNumber: string;
  filterCity: string;
  filterType: PropertyType | 'ALL';
  filterMinPrice: string;
  filterMaxPrice: string;
  isTrialActive: boolean;
};

const PropertiesPage = ({ properties, leads, filterPropertyNumber: initialFilterPropertyNumber, filterCity: initialFilterCity, filterType: initialFilterType, filterMinPrice: initialFilterMinPrice, filterMaxPrice: initialFilterMaxPrice, isTrialActive }: PropertiesPageProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkLeadModal, setShowLinkLeadModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithDetails | null>(null);
  const [filterPropertyNumber, setFilterPropertyNumber] = useState(initialFilterPropertyNumber);
  const [filterCity, setFilterCity] = useState(initialFilterCity);
  const [filterType, setFilterType] = useState(initialFilterType);
  const [filterMinPrice, setFilterMinPrice] = useState(initialFilterMinPrice);
  const [filterMaxPrice, setFilterMaxPrice] = useState(initialFilterMaxPrice);
  const router = useRouter();

  const debouncedPropertyNumber = useDebounce(filterPropertyNumber, 500);
  const debouncedCity = useDebounce(filterCity, 500);

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
  }, [debouncedPropertyNumber, debouncedCity, filterType, filterMinPrice, filterMaxPrice, router.query]);

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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
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

  return (
    <DashboardLayout>
      {!isTrialActive && (
        <Alert variant="warning">
          Votre période d\'essai a expiré. Vous ne pouvez plus ajouter de nouvelles propriétés. Veuillez mettre à niveau votre plan pour continuer.
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Gestion des propriétés</h1>
        <Button onClick={() => setShowAddModal(true)} className="btn-primary" disabled={!isTrialActive}>
          Ajouter une propriété
        </Button>
      </div>

      <div className="mb-4">
        <DynamicMap properties={properties} />
      </div>

      <div className="card">
        <Row className="mb-4">
        <Col md={3}>
          <Form.Group controlId="propertyNumberFilter">
            <Form.Label>Filtrer par N° Propriété</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: PR000001"
              value={filterPropertyNumber}
              onChange={(e) => setFilterPropertyNumber(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="cityFilter">
            <Form.Label>Filtrer par Ville</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Paris"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="typeFilter">
            <Form.Label>Filtrer par Type</Form.Label>
            <Form.Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PropertyType)}
            >
              <option value="ALL">Tous les types</option>
              {Object.values(PropertyType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="priceRangeFilter">
            <Form.Label>Filtrer par Prix</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="number"
                placeholder="Min"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                className="me-2"
              />
              <Form.Control
                type="number"
                placeholder="Max"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Table hover responsive>
        <thead>
          <tr>
            <th>Propriété</th>
            <th>Adresse</th>
            <th>Ville</th>
            <th>Code Postal</th>
            <th>Type</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.id} className={!isTrialActive ? 'text-muted' : ''}>
              <td>{`PR${String(property.propertyNumber).padStart(6, '0')}`}</td>
              <td>{property.address}</td>
              <td>{property.city}</td>
              <td>{property.zipCode}</td>
              <td>{property.type}</td>
              <td>{property.price}</td>
              <td>{property.status}</td>
              <td>
                <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                                        Actions
                                      </Dropdown.Toggle>
                                      <CustomDropdownMenu className="dropdown-menu-fix">
                                        <Dropdown.Item onClick={() => handleOpenViewModal(property)}>Visualiser</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleOpenEditModal(property)}>Modifier</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleOpenLinkLeadModal(property)}>Lier à un prospect</Dropdown.Item>
                                        <Dropdown.Item variant="danger" onClick={() => handleDeleteProperty(property.id)}>Supprimer</Dropdown.Item>
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

      {selectedProperty && (
        <ViewPropertyModal
          show={showViewModal}
          handleClose={() => setShowViewModal(false)}
          property={selectedProperty}
        />
      )}

      {selectedProperty && (
        <EditPropertyModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          property={selectedProperty}
          onPropertyUpdated={refreshData}
        />
      )}

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
  const { propertyNumber, city, type, minPrice, maxPrice } = context.query;
  const filterPropertyNumber = propertyNumber ? String(propertyNumber) : '';
  const filterCity = city ? String(city) : '';
  const filterType = type && Object.values(PropertyType).includes(type as PropertyType) ? type as PropertyType : 'ALL';
  const filterMinPrice = minPrice ? parseFloat(String(minPrice)) : undefined;
  const filterMaxPrice = maxPrice ? parseFloat(String(maxPrice)) : undefined;

  const whereClause: Prisma.PropertyWhereInput = {
    agencyId: session.user.agencyId,
  };

  if (filterPropertyNumber) {
    const numberPart = filterPropertyNumber.replace('PR', '');
    if (numberPart) {
      // Use a raw query for partial matching on the string representation of propertyNumber
      // This is a workaround for SQLite's limitations with 'contains' on Int fields
      whereClause.AND = [
        ...(whereClause.AND || []),
        Prisma.sql`CAST("propertyNumber" AS TEXT) LIKE ${'%' + numberPart + '%'}`, // Use Prisma.sql
      ];
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
    whereClause.price = { ...(whereClause.price || {}), lte: filterMaxPrice };
  }

  const [properties, leads, trialIsActive] = await Promise.all([
    prisma.property.findMany({
      where: whereClause,
      select: {
        id: true,
        propertyNumber: true,
        address: true,
        city: true,
        zipCode: true,
        country: true,
        type: true,
        price: true,
        status: true,
        description: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        agencyId: true,
        images: true,
        leads: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.lead.findMany({
      where: {
        agencyId: session.user.agencyId,
      },
    }),
    isTrialActive(session.user.agencyId),
  ]);

  return {
    props: {
      properties: JSON.parse(JSON.stringify(properties)),
      leads: JSON.parse(JSON.stringify(leads)),
      filterPropertyNumber,
      filterCity,
      filterType,
      filterMinPrice: filterMinPrice || '',
      filterMaxPrice: filterMaxPrice || '',
      isTrialActive: trialIsActive,
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER']);

export default PropertiesPage;