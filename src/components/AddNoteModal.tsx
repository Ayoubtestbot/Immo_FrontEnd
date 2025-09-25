import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import type { Lead } from '@prisma/client';

type AddNoteModalProps = {
  show: boolean;
  handleClose: () => void;
  lead: Lead | null;
  onNoteAdded: () => void;
};

const AddNoteModal = ({ show, handleClose, lead, onNoteAdded }: AddNoteModalProps) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to add note');
      }

      setLoading(false);
      setContent('');
      onNoteAdded();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter une note</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="noteContent">
            <Form.Label>Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter la note'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddNoteModal;
