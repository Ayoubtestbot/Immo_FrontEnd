import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import type { Property } from '@prisma/client';

type LinkPropertyModalProps = {
  show: boolean;
  handleClose: () => void;
  properties: Property[];
  leadId: string;
  onPropertyLinked: () => void;
};

const LinkPropertyModal = ({ show, handleClose, properties, leadId, onPropertyLinked }: LinkPropertyModalProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedPropertyId) {
      setError('Please select a property.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/leads/${leadId}/link-property`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: selectedPropertyId }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to link property');
      }
      
      setLoading(false);
      onPropertyLinked();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Lier une propriété</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner une propriété</Form.Label>
            <Form.Select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} required>
              <option value="">-- Choisir une propriété --</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>{property.address}, {property.city}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Liaison en cours...' : 'Lier la propriété'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LinkPropertyModal;
