import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { countries } from '@/utils/locations';
import Select from 'react-select';

type AddProjectModalProps = {
  show: boolean;
  handleClose: () => void;
  onProjectAdded: () => void;
};

const AddProjectModal = ({ show, handleClose, onProjectAdded }: AddProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (country) {
      const selectedCountry = countries.find(c => c.name === country);
      setCities(selectedCountry ? selectedCountry.cities : []);
      setCity('');
    }
  }, [country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, country, city }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create project');
      }

      setLoading(false);
      onProjectAdded();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const countryOptions = countries.map(country => ({ value: country.name, label: country.name }));
  const cityOptions = cities.map(city => ({ value: city, label: city }));

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un nouveau projet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom du projet</Form.Label>
            <Form.Control type="text" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pays</Form.Label>
                <Select
                  options={countryOptions}
                  onChange={(option: { value: string; label: string } | null) => setCountry(option ? option.value : '')}
                  isClearable
                  isSearchable
                  placeholder="Sélectionner un pays"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ville</Form.Label>
                <Select
                  options={cityOptions}
                  onChange={(option: { value: string; label: string } | null) => setCity(option ? option.value : '')}
                  isClearable
                  isSearchable
                  placeholder="Sélectionner une ville"
                  isDisabled={!country}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Ajout en cours...' : 'Ajouter le projet'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddProjectModal;
