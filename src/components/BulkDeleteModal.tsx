
import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

interface BulkDeleteModalProps {
  show: boolean;
  onClose: () => void;
  selectedLeadIds: string[];
  onLeadsDeleted: () => void;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  show,
  onClose,
  selectedLeadIds,
  onLeadsDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/leads/bulk-delete', {
        leadIds: selectedLeadIds,
      });
      console.log('Bulk delete successful:', response.data);
      onLeadsDeleted();
      onClose();
    } catch (err: any) {
      console.error('Bulk delete failed:', err);
      setError(err.response?.data?.error || 'Failed to delete leads.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Supprimer les prospects (en masse)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Etes-vous sur de vouloir supprimer {selectedLeadIds.length} prospect(s) ?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="danger" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Suppression...' : 'Supprimer'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkDeleteModal;
