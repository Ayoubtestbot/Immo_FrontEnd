import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import type { Lead } from '@prisma/client';

type LinkLeadModalProps = {
  show: boolean;
  handleClose: () => void;
  leads: Lead[];
  propertyId: string;
  onLeadLinked: () => void;
};

const LinkLeadModal = ({ show, handleClose, leads, propertyId, onLeadLinked }: LinkLeadModalProps) => {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredLeads = searchTerm.length > 1
    ? leads.filter(lead =>
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedLeadId) {
      setError('Please select a lead.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/properties/${propertyId}/link-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLeadId }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to link lead');
      }
      
      setLoading(false);
      onLeadLinked();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Lier un prospect</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Rechercher un prospect</Form.Label>
            <Form.Control
              type="text"
              placeholder="Taper pour rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner un prospect</Form.Label>
            <ul className="list-group">
              {searchTerm.length <= 1 && <li className="list-group-item text-muted">Commencez à taper pour voir les prospects...</li>}
              {filteredLeads.map(lead => (
                <li
                  key={lead.id}
                  className={`list-group-item ${selectedLeadId === lead.id ? 'active' : ''}`}
                  onClick={() => setSelectedLeadId(lead.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {`${lead.firstName} ${lead.lastName}`}
                </li>
              ))}
            </ul>
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Liaison en cours...' : 'Lier le prospect'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LinkLeadModal;
