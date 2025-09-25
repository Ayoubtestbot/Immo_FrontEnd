import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Property, PropertyType, PropertyStatus } from '@prisma/client';

type EditPropertyModalProps = {
  show: boolean;
  handleClose: () => void;
  property: Property | null;
  onPropertyUpdated: () => void;
};

const EditPropertyModal = ({ show, handleClose, property, onPropertyUpdated }: EditPropertyModalProps) => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [type, setType] = useState<PropertyType>(PropertyType.MAISON);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.A_VENDRE);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (property) {
      setAddress(property.address);
      setCity(property.city);
      setZipCode(property.zipCode);
      setCountry(property.country);
      setType(property.type);
      setPrice(property.price);
      setStatus(property.status);
      setDescription(property.description || '');
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/properties/${property?.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, city, zipCode, country, type, price, status, description }),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update property');
      }

      setLoading(false);
      onPropertyUpdated();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modifier la propriété</Modal.Title>
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
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
              {Object.values(PropertyType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Prix</Form.Label>
            <Form.Control type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Statut</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)}>
              {Object.values(PropertyStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPropertyModal;
