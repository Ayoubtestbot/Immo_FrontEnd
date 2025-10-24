import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import type { Lead, User, Source } from '@prisma/client';
import { LeadStatus } from '@prisma/client';
import { leadStatusTranslations } from '@/utils/leadStatusTranslations'; // New import

type UpdateLeadModalProps = {
  show: boolean;
  handleClose: () => void;
  lead: (Lead & { assignedTo: User | null }) | null;
  agents: User[];
  onLeadUpdated: () => void;
};

const UpdateLeadModal = ({ show, handleClose, lead, agents, onLeadUpdated }: UpdateLeadModalProps) => {
  const [status, setStatus] = useState<LeadStatus>(LeadStatus.NEW);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTimeHour, setAppointmentTimeHour] = useState<string>(''); // New state for hour
  const [appointmentTimeMinute, setAppointmentTimeMinute] = useState<string>(''); // New state for minute
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [trafficSource, setTrafficSource] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setAssignedToId(lead.assignedToId);
      setFirstName(lead.firstName);
      setLastName(lead.lastName);
      setEmail(lead.email);
      setPhone(lead.phone || '');
      setSourceId(lead.sourceId || undefined);
      if (lead.appointmentDate) {
        const date = new Date(lead.appointmentDate);
        setAppointmentDate(date.toISOString().split('T')[0]);
        setAppointmentTimeHour(date.getHours().toString().padStart(2, '0'));
        setAppointmentTimeMinute(date.getMinutes().toString().padStart(2, '0'));
      } else {
        setAppointmentDate('');
        setAppointmentTimeHour('');
        setAppointmentTimeMinute('');
      }
    }

    const fetchSources = async () => {
      try {
        const res = await fetch('/api/sources');
        if (res.ok) {
          const data = await res.json();
          setSources(data);
        } else {
          setError('Failed to fetch sources');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch sources');
      }
    };
    fetchSources();
  }, [lead, show]); // Added show to dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setLoading(true);
    setError('');

    const data: any = { firstName, lastName, email, phone, sourceId, status, assignedToId };
    if (status === LeadStatus.APPOINTMENT_SCHEDULED) {
      if (appointmentDate) {
        const [year, month, day] = appointmentDate.split('-').map(Number);
        const hour = parseInt(appointmentTimeHour || '0');
        const minute = parseInt(appointmentTimeMinute || '0');
        const combinedDateTime = new Date(year, month - 1, day, hour, minute);
        data.appointmentDate = combinedDateTime.toISOString();
      } else {
        data.appointmentDate = null;
      }
    }

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update lead');
      }

      setLoading(false);
      onLeadUpdated();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Mettre à jour le prospect</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="firstName">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              type="text"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="lastName">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="phone">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control
              type="text"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="source">
            <Form.Label>Source</Form.Label>
            <Form.Select
              value={sourceId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSourceId(e.target.value || undefined)}
            >
              <option value="">-- Sélectionner une source --</option>
              {sources.map(source => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Statut</Form.Label>
            <Form.Select value={status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as LeadStatus)}>
              {Object.values(LeadStatus).map(s => (
                <option key={s} value={s}>{leadStatusTranslations[s]}</option>
              ))}
            </Form.Select>
          </Form.Group>
          {status === LeadStatus.APPOINTMENT_SCHEDULED && (
            <>
              <Form.Group className="mb-3" controlId="appointmentDate">
                <Form.Label>Date du rendez-vous</Form.Label>
                <Form.Control
                  type="date"
                  value={appointmentDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentDate(e.target.value)}
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="appointmentTimeHour">
                    <Form.Label>Heure</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="23"
                      value={appointmentTimeHour}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentTimeHour(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="appointmentTimeMinute">
                    <Form.Label>Minute</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="59"
                      value={appointmentTimeMinute}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentTimeMinute(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
          <Form.Group className="mb-3" controlId="assignedTo">
            <Form.Label>Assigner à</Form.Label>
            <Form.Select value={assignedToId || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssignedToId(e.target.value || null)}>
              <option value="">Non assigné</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button as="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button as="button" variant="primary" type="submit" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Sauvegarder'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateLeadModal;