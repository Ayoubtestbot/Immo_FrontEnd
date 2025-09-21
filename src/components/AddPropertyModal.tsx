import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

type AddPropertyModalProps = {
  show: boolean;
  handleClose: () => void;
  onPropertyAdded: () => void;
};

const AddPropertyModal = ({ show, handleClose, onPropertyAdded }: AddPropertyModalProps) => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, city, zipCode, country }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create property');
      }
      
      setLoading(false);
      onPropertyAdded();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter une nouvelle propriété</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Adresse</Form.Label>
            <Form.Control type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Ville</Form.Label>
            <Form.Control type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Code Postal</Form.Label>
            <Form.Control type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Pays</Form.Label>
            <Form.Control type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Ajout en cours...' : 'Ajouter la propriété'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPropertyModal;
