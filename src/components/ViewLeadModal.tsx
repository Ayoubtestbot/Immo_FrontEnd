import { Modal, Button, Badge, ListGroup } from 'react-bootstrap';
import type { Lead, User, Note, Activity, Property } from '@prisma/client';
import { getTranslatedLeadStatus } from '@/utils/leadStatusTranslations';
import { format } from 'date-fns';

type LeadWithDetails = Lead & {
  assignedTo: User | null;
  notes: (Note & { author: User })[];
  activities: Activity[];
  properties: Property[]; // New field
};

type ViewLeadModalProps = {
  show: boolean;
  handleClose: () => void;
  lead: LeadWithDetails | null;
};

const ViewLeadModal = ({ show, handleClose, lead }: ViewLeadModalProps) => {
  if (!lead) {
    return null;
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {`Détails du Prospect: ${lead.firstName} ${lead.lastName}`}
        </Modal.Title>
        <Badge bg="primary" className="ms-2">{getTranslatedLeadStatus(lead.status)}</Badge>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Email:</strong> {lead.email}</p>
        <p><strong>Téléphone:</strong> {lead.phone || '-'}</p>
        <p><strong>Ville:</strong> {lead.city || '-'}</p>
        <p><strong>Source de trafic:</strong> {lead.trafficSource || '-'}</p>
        <p><strong>Assigné à:</strong> {lead.assignedTo?.name || <span className="text-muted">Non assigné</span>}</p>
        <p><strong>Créé le:</strong> {format(new Date(lead.createdAt), 'dd/MM/yyyy HH:mm')}</p>
        <hr />
        <h5>Propriétés liées</h5>
        <ListGroup variant="flush">
          {lead.properties && lead.properties.length > 0 ? (
            lead.properties.map(property => (
              <ListGroup.Item key={property.id}>
                {property.address}, {property.city}
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>Aucune propriété liée pour le moment.</ListGroup.Item>
          )}
        </ListGroup>
        <hr />
        <h5>Historique et Notes</h5>
        <ListGroup variant="flush">
          {lead.notes.map(note => (
            <ListGroup.Item key={note.id}>
              <div className="d-flex w-100 justify-content-between">
                <p className="mb-1">{note.content}</p>
                <small>{format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm')}</small>
              </div>
              <small className="text-muted">Par {note.author.name}</small>
            </ListGroup.Item>
          ))}
          {lead.activities
            .filter(activity => activity.type !== 'NOTE_ADDED')
            .map(activity => (
            <ListGroup.Item key={activity.id}>
              <div className="d-flex w-100 justify-content-between">
                <p className="mb-1">{activity.details}</p>
                <small>{format(new Date(activity.createdAt), 'dd/MM/yyyy HH:mm')}</small>
              </div>
              <small className="text-muted">
                {activity.type !== 'STATUS_CHANGE' ? activity.type : ''}
              </small>
            </ListGroup.Item>
          ))}
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

export default ViewLeadModal;
