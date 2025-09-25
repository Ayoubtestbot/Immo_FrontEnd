import { Modal, Button, Badge, ListGroup, Carousel } from 'react-bootstrap';
import type { Property, Image, Lead } from '@prisma/client';
import DynamicMap from './DynamicMap';

type PropertyWithDetails = Property & {
  images: Image[];
  leads: Lead[];
  propertyNumber: number; // New field
};

type ViewPropertyModalProps = {
  show: boolean;
  handleClose: () => void;
  property: PropertyWithDetails | null;
};

const ViewPropertyModal = ({ show, handleClose, property }: ViewPropertyModalProps) => {
  if (!property) {
    return null;
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{`Propriété PR${String(property.propertyNumber).padStart(6, '0')} - ${property.address}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {property.images.length > 0 && (
          <Carousel className="mb-4">
            {property.images.map(image => (
              <Carousel.Item key={image.id}>
                <img
                  className="d-block w-100"
                  src={image.url}
                  alt="Property image"
                />
              </Carousel.Item>
            ))}
          </Carousel>
        )}
        <h5>Détails de la propriété <Badge bg="primary">{property.status}</Badge></h5>
        <p><strong>Type:</strong> {property.type}</p>
        <p><strong>Prix:</strong> {property.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
        <p><strong>Description:</strong></p>
        <p>{property.description || '-'}</p>
        <hr />
        <h5>Localisation</h5>
        <div style={{ height: '300px' }}>
          <DynamicMap properties={[property]} />
        </div>
        <hr />
        <h5>Prospects intéressés</h5>
        <ListGroup variant="flush">
          {property.leads.length > 0 ? (
            property.leads.map(lead => (
              <ListGroup.Item key={lead.id}>
                {lead.firstName} {lead.lastName}
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>Aucun prospect intéressé pour le moment.</ListGroup.Item>
          )}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewPropertyModal;