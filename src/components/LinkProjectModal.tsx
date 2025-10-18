import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Project } from '@prisma/client';

type LinkProjectModalProps = {
  show: boolean;
  handleClose: () => void;
  projects: Project[];
  propertyIds: string[];
  onProjectLinked: () => void;
};

const LinkProjectModal = ({ show, handleClose, projects, propertyIds, onProjectLinked }: LinkProjectModalProps) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedProject) {
      setError('Please select a project');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/properties/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds, projectId: selectedProject }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to link project');
      }

      setLoading(false);
      onProjectLinked();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const projectOptions = projects.map(project => ({ value: project.id, label: project.name }));

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Link to Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Project</Form.Label>
            <Form.Select value={selectedProject} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedProject(e.target.value)} required>
              <option value="">Select a project</option>
              {projectOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Linking...' : 'Link to Project'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LinkProjectModal;
