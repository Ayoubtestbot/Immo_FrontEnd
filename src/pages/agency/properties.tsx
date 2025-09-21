import type { GetServerSideProps } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import AddPropertyModal from '@/components/AddPropertyModal';
import { prisma } from '@/lib/prisma';
import type { Property } from '@prisma/client';
import { Table, Button, Alert } from 'react-bootstrap';

type PropertiesPageProps = {
  properties: Property[];
};

const PropertiesPage = ({ properties }: PropertiesPageProps) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handlePropertyAdded = () => {
    router.replace(router.asPath);
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des propriétés</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Ajouter une propriété
        </Button>
      </div>

      {properties.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Adresse</th>
              <th>Ville</th>
              <th>Code Postal</th>
              <th>Pays</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property, index) => (
              <tr key={property.id}>
                <td>{index + 1}</td>
                <td>{property.address}</td>
                <td>{property.city}</td>
                <td>{property.zipCode}</td>
                <td>{property.country}</td>
                <td>
                  <Button variant="outline-primary" size="sm">Voir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          Aucune propriété trouvée. Cliquez sur "Ajouter une propriété" pour commencer !
        </Alert>
      )}

      <AddPropertyModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onPropertyAdded={handlePropertyAdded}
      />
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuth(async (context, session) => {
  const properties = await prisma.property.findMany({
    where: {
      agency: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  return {
    props: {
      properties: JSON.parse(JSON.stringify(properties)),
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER']);

export default PropertiesPage;
