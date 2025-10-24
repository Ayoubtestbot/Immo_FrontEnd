import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Button, Table, Form, Alert, Modal } from 'react-bootstrap';
import { Source } from '@prisma/client';

interface SourcesPageProps {
  initialSources: Source[];
}

const SourcesPage = ({ initialSources }: SourcesPageProps) => {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [newSourceName, setNewSourceName] = useState('');
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [editSourceName, setEditSourceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const refreshData = async () => {
    const res = await fetch('/api/sources');
    if (res.ok) {
      const data = await res.json();
      setSources(data);
    } else {
      setError('Failed to fetch sources');
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSourceName }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to add source');
      }

      setNewSourceName('');
      refreshData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/sources/${editingSource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editSourceName }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update source');
      }

      setEditingSource(null);
      setEditSourceName('');
      refreshData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this source?')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to delete source');
      }

      refreshData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="h2 mb-4">Gestion des Sources</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mb-4">
        <h3>Ajouter une nouvelle source</h3>
        <Form onSubmit={handleAddSource} className="d-flex">
          <Form.Control
            type="text"
            placeholder="Nom de la source"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            required
            className="me-2"
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </Button>
        </Form>
      </div>

      <h3>Sources existantes</h3>
      {sources.length === 0 ? (
        <Alert variant="info">Aucune source ajoutée pour le moment.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id}>
                <td>{source.name}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setEditingSource(source);
                      setEditSourceName(source.name);
                    }}
                    disabled={loading}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteSource(source.id)}
                    disabled={loading}
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Edit Source Modal */}
      <Modal show={!!editingSource} onHide={() => setEditingSource(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier la source</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSource}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="editSourceName">
              <Form.Label>Nom de la source</Form.Label>
              <Form.Control
                type="text"
                value={editSourceName}
                onChange={(e) => setEditSourceName(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditingSource(null)} disabled={loading}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Sauvegarder'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  const agencyId = session.user.agencyId;

  if (!agencyId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const sources = await prisma.source.findMany({
      where: { agencyId },
      orderBy: { name: 'asc' },
    });

    return {
      props: {
        initialSources: JSON.parse(JSON.stringify(sources)),
      },
    };
  } catch (error) {
    console.error('Error fetching sources:', error);
    return {
      props: {
        initialSources: [],
      },
    };
  }
}, ['AGENCY_OWNER']); // Only agency owners can manage sources

export default SourcesPage;