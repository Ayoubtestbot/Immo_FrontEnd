import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { UserRole } from '@prisma/client';
import { getTranslatedUserRole } from '@/utils/userRoleTranslations'; // New import

type AddUserModalProps = {
  show: boolean;
  handleClose: () => void;
  onUserAdded: () => void;
};

const AddUserModal = ({ show, handleClose, onUserAdded }: AddUserModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.AGENCY_MEMBER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to add user');
      }
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole(UserRole.AGENCY_MEMBER);

      setLoading(false);
      onUserAdded();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un nouveau membre</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Rôle</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {Object.values(UserRole)
                .filter(r => r !== UserRole.ADMIN && r !== UserRole.AGENCY_OWNER) // Filter out ADMIN and AGENCY_OWNER roles
                .map(r => (
                  <option key={r} value={r}>{getTranslatedUserRole(r)}</option>
                ))}
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Ajout en cours...' : 'Ajouter le membre'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddUserModal;