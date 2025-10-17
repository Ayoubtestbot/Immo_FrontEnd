import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { Project } from '@prisma/client';
import { countries } from '@/utils/locations';
import Select from 'react-select';

type EditProjectModalProps = {
  show: boolean;
  handleClose: () => void;
  project: Project | null;
  onProjectUpdated: () => void;
};

const EditProjectModal = ({ show, handleClose, project, onProjectUpdated }: EditProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setCountry(project.country || '');
      const selectedCountry = countries.find(c => c.name === (project.country || ''));
      setCities(selectedCountry ? selectedCountry.cities : []);
      setCity(project.city || '');
    }
  }, [project]);

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
      const res = await fetch(`/api/projects/${project?.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, country, city }),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update project');
      }

      setLoading(false);
      onProjectUpdated();
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
        <Modal.Title>Modifier le projet</Modal.Title>
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
                  value={countryOptions.find(c => c.value === country)}
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
                  value={cityOptions.find(c => c.value === city)}
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
              {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProjectModal;
