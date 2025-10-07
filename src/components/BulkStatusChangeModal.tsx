import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { LeadStatus } from '@prisma/client';
import { leadStatusTranslations } from '@/utils/leadStatusTranslations';

interface BulkStatusChangeModalProps {
  show: boolean;
  onClose: () => void;
  selectedLeadIds: string[];
  onLeadsUpdated: () => void;
}

const BulkStatusChangeModal: React.FC<BulkStatusChangeModalProps> = ({
  show,
  onClose,
  selectedLeadIds,
  onLeadsUpdated,
}) => {
  const [newStatus, setNewStatus] = useState<LeadStatus | ''>(LeadStatus.NEW);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!newStatus) {
      setError('Please select a new status.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch('/api/leads/bulk-update', {
        leadIds: selectedLeadIds,
        status: newStatus,
      });
      console.log('Bulk status update successful:', response.data);
      onLeadsUpdated();
      onClose();
    } catch (err: any) {
      console.error('Bulk status update failed:', err);
      setError(err.response?.data?.error || 'Failed to update lead status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Changer le statut des prospects (en masse)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>{selectedLeadIds.length} prospect(s) sélectionné(s) seront mis à jour.</p>
        <Form.Group className="mb-3" controlId="newStatus">
          <Form.Label>Nouveau statut</Form.Label>
          <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as LeadStatus)}>
            <option value="">-- Sélectionner un statut --</option>
            {Object.values(LeadStatus).map(s => (
              <option key={s} value={s}>{leadStatusTranslations[s]}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading || !newStatus}>
          {loading ? 'Mise à jour...' : 'Mettre à jour le statut'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkStatusChangeModal;
