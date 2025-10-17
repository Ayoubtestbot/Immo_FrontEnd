import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { Property, PropertyType, PropertyStatus, Project } from '@prisma/client';
import { propertyStatusTranslations } from '@/utils/propertyStatusTranslations';
import { countries } from '@/utils/locations';
import Select from 'react-select';

type DuplicatePropertyModalProps = {
  show: boolean;
  handleClose: () => void;
  property: (Property & { project: Project | null }) | null;
  onPropertyDuplicated: () => void;
};

const DuplicatePropertyModal = ({ show, handleClose, property, onPropertyDuplicated }: DuplicatePropertyModalProps) => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [type, setType] = useState<PropertyType>(PropertyType.MAISON);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.A_VENDRE);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [etage, setEtage] = useState<number | undefined>(undefined);
  const [superficie, setSuperficie] = useState<number | undefined>(undefined);
  const [tranche, setTranche] = useState('');
  const [numAppartement, setNumAppartement] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (property) {
      setAddress(property.address);
      setCountry(property.country);
      const selectedCountry = countries.find(c => c.name === property.country);
      setCities(selectedCountry ? selectedCountry.cities : []);
      setCity(property.city);
      setZipCode(property.zipCode);
      setType(property.type);
      setPrice(property.price);
      setStatus(property.status);
      setDescription(property.description || '');
      setEtage(property.etage || undefined);
      setSuperficie(property.superficie || undefined);
      setTranche(property.tranche || '');
      setNumAppartement(property.numAppartement || '');
      setSelectedProject(property.projectId || undefined);
    }
  }, [property]);

  useEffect(() => {
    if (country) {
      const selectedCountry = countries.find(c => c.name === country);
      setCities(selectedCountry ? selectedCountry.cities : []);
      setCity('');
    }
  }, [country]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (show) {
      fetchProjects();
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/properties`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, city, zipCode, country, type, price, status, description, etage, superficie, tranche, numAppartement, projectId: selectedProject, images: [] }),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to duplicate property');
      }

      setLoading(false);
      onPropertyDuplicated();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const countryOptions = countries.map(country => ({ value: country.name, label: country.name }));
  const cityOptions = cities.map(city => ({ value: city, label: city }));
  const projectOptions = projects.map(project => ({ value: project.id, label: project.name }));

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Dupliquer la propriété</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Projet</Form.Label>
                <Select
                  options={projectOptions}
                  onChange={(option: { value: string; label: string } | null) => setSelectedProject(option ? option.value : '')}
                  isClearable
                  isSearchable
                  placeholder="Sélectionner un projet"
                  value={projectOptions.find(p => p.value === selectedProject)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Statut</Form.Label>
                <Form.Select value={status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as PropertyStatus)}>
                  {Object.entries(propertyStatusTranslations).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Adresse</Form.Label>
                <Form.Control type="text" value={address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Code Postal</Form.Label>
                <Form.Control type="text" value={zipCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZipCode(e.target.value)} required />
              </Form.Group>
            </Col>
          </Row>
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
          <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as PropertyType)}>
                    {Object.values(PropertyType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix</Form.Label>
                  <Form.Control type="number" value={price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(parseFloat(e.target.value))} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Etage</Form.Label>
                  <Form.Control type="number" value={etage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEtage(parseInt(e.target.value))} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Superficie</Form.Label>
                  <Form.Control type="number" value={superficie} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuperficie(parseFloat(e.target.value))} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tranche</Form.Label>
                  <Form.Control type="text" value={tranche} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTranche(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Numéro d'appartement</Form.Label>
                  <Form.Control type="text" value={numAppartement} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumAppartement(e.target.value)} />
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
              {loading ? 'Duplication en cours...' : 'Dupliquer'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DuplicatePropertyModal;
