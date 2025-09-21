import type { GetServerSideProps } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import AddLeadModal from '@/components/AddLeadModal';
import { prisma } from '@/lib/prisma';
import type { Lead } from '@prisma/client';
import { Table, Button, Alert } from 'react-bootstrap';

type LeadsPageProps = {
  leads: Lead[];
};

const LeadsPage = ({ leads }: LeadsPageProps) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleLeadAdded = () => {
    router.replace(router.asPath);
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des prospects</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Ajouter un prospect
        </Button>
      </div>

      {leads.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr key={lead.id}>
                <td>{index + 1}</td>
                <td>{`${lead.firstName} ${lead.lastName}`}</td>
                <td>{lead.email}</td>
                <td>{lead.phone || '-'}</td>
                <td>
                  <span className={`badge bg-${lead.status === 'NEW' ? 'primary' : 'secondary'}`}>
                    {lead.status}
                  </span>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm">Voir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          Aucun prospect trouvé. Cliquez sur "Ajouter un prospect" pour commencer !
        </Alert>
      )}

      <AddLeadModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onLeadAdded={handleLeadAdded}
      />
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuth(async (context, session) => {
  const leads = await prisma.lead.findMany({
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
      leads: JSON.parse(JSON.stringify(leads)),
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER']);

export default LeadsPage;
