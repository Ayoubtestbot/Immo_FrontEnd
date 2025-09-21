import type { GetServerSideProps } from 'next';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { prisma } from '@/lib/prisma';
import type { Ticket } from '@prisma/client';
import { Table, Button, Alert } from 'react-bootstrap';

type TicketsPageProps = {
  tickets: Ticket[];
};

const TicketsPage = ({ tickets }: TicketsPageProps) => {
  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des tickets</h1>
      </div>

      {tickets.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Sujet</th>
              <th>Status</th>
              <th>Priorité</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={ticket.id}>
                <td>{index + 1}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.status}</td>
                <td>{ticket.priority}</td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button variant="outline-primary" size="sm">Voir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          Aucun ticket trouvé.
        </Alert>
      )}
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuth(async (context, session) => {
  const tickets = await prisma.ticket.findMany({
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
      tickets: JSON.parse(JSON.stringify(tickets)),
    },
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER']);

export default TicketsPage;
