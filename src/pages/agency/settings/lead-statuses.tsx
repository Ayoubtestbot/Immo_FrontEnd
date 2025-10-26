import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import type { LeadStatusOption } from '@prisma/client';

const LeadStatusesPage = ({ leadStatusOptions: initialLeadStatusOptions }: { leadStatusOptions: LeadStatusOption[] }) => {
  const [statuses, setStatuses] = useState<LeadStatusOption[]>(initialLeadStatusOptions);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  const [editingStatus, setEditingStatus] = useState<LeadStatusOption | null>(null);

  const fetchStatuses = async () => {
    const res = await fetch('/api/lead-status-options');
    const data = await res.json();
    console.log('data from fetchStatuses:', data);
    setStatuses(data);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStatus(null);
  };

  const handleShowModal = (status: LeadStatusOption | null = null) => {
    setEditingStatus(status);
    setShowModal(true);
  };

  const handleSaveStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const translation = (form.elements.namedItem('translation') as HTMLInputElement).value;
    const color = (form.elements.namedItem('color') as HTMLInputElement).value;
    const isLastStep = (form.elements.namedItem('isLastStep') as HTMLInputElement).checked;

    const method = editingStatus ? 'PUT' : 'POST';
    const url = editingStatus ? `/api/lead-status-options/${editingStatus.id}` : '/api/lead-status-options';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, translation, color, isLastStep }),
    });

    if (res.ok) {
      fetchStatuses();
      handleCloseModal();
    }
  };

  const handleDeleteStatus = async (id: string) => {
    if (window.confirm('Etes-vous sûr de vouloir supprimer ce statut ?')) {
      const res = await fetch(`/api/lead-status-options/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchStatuses();
      }
    }
  };

  const handleToggleLastStep = async (status: LeadStatusOption) => {
    console.log('isLastStep before sending:', !status.isLastStep);
    const res = await fetch(`/api/lead-status-options/${status.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...status, isLastStep: !status.isLastStep }),
      }
    );

    if (res.ok) {
      fetchStatuses();
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Gérer les statuts de prospect</h1>
        <Button onClick={() => handleShowModal()}>Ajouter un statut</Button>
      </div>

      <Table hover responsive>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Traduction</th>
            <th>Couleur</th>
            <th>Dernière étape</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {console.log(statuses)}
          {statuses.map((status) => (
            <tr key={status.id}>
              <td>{status.name}</td>
              <td>{status.translation}</td>
              <td><span className="badge" style={{ backgroundColor: status.color }}>{status.color}</span></td>
              <td><input type="checkbox" checked={status.isLastStep} onChange={() => handleToggleLastStep(status)} /></td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleShowModal(status)}>Modifier</Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDeleteStatus(status.id)}>Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingStatus ? 'Modifier le statut' : 'Ajouter un statut'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveStatus}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nom</Form.Label>
              <Form.Control type="text" defaultValue={editingStatus?.name} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="translation">
              <Form.Label>Traduction</Form.Label>
              <Form.Control type="text" defaultValue={editingStatus?.translation} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="color">
              <Form.Label>Couleur</Form.Label>
              <Form.Control type="color" defaultValue={editingStatus?.color} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="isLastStep">
              <Form.Check type="checkbox" label="Dernière étape" defaultChecked={editingStatus?.isLastStep} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Fermer</Button>
            <Button variant="primary" type="submit">Enregistrer</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </DashboardLayout>
  );
};

export default LeadStatusesPage;

export const getServerSideProps: GetServerSideProps = withAuth(async (context, session) => {
  const leadStatusOptionsRes = await fetch(`${process.env.NEXTAUTH_URL}/api/lead-status-options`, {
    headers: {
      cookie: context.req.headers.cookie || '',
    },
  });
  const leadStatusOptions = await leadStatusOptionsRes.json();

  return {
    props: {
      leadStatusOptions,
    },
  };
}, ['AGENCY_OWNER']);
