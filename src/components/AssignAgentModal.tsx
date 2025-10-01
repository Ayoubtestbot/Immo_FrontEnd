import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

interface Agent {
  id: string;
  name: string;
  phone?: string;
}

interface AssignAgentModalProps {
  show: boolean;
  onClose: () => void;
  leadId: string | null;
  currentAssignedAgentId: string | null;
  onAgentAssigned: (updatedLead: any) => void;
}

const AssignAgentModal: React.FC<AssignAgentModalProps> = ({
  show,
  onClose,
  leadId,
  currentAssignedAgentId,
  onAgentAssigned,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(currentAssignedAgentId);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setSelectedAgentId(currentAssignedAgentId);
      const fetchAgents = async () => {
        try {
          const response = await axios.get<Agent[]>('/api/users/agents');
          setAgents(response.data);
        } catch (err) {
          console.error('Failed to fetch agents:', err);
          setError('Failed to load agents.');
        } finally {
          setLoadingAgents(false);
        }
      };
      fetchAgents();
    }
  }, [show, currentAssignedAgentId]);

  const handleAssignAgent = async () => {
    if (!leadId || !selectedAgentId) {
      setError('Please select an agent.');
      return;
    }

    setAssigning(true);
    setError(null);
    try {
      const response = await axios.patch(`/api/leads/${leadId}/update`, {
        assignedToId: selectedAgentId,
      });
      onAgentAssigned(response.data);
      onClose();
    } catch (err: any) {
      console.error('Failed to assign agent:', err);
      setError(err.response?.data?.error || 'Failed to assign agent.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Agent to Lead</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingAgents ? (
          <p>Loading agents...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <Form.Group controlId="agentSelect">
            <Form.Label>Select Agent</Form.Label>
            <Form.Control
              as="select"
              value={selectedAgentId || ''}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">-- Select an Agent --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} {agent.phone ? `(${agent.phone})` : ''}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        )}
        {error && !loadingAgents && <p className="text-danger mt-3">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAssignAgent}
          disabled={!selectedAgentId || assigning || loadingAgents}
        >
          {assigning ? 'Assigning...' : 'Assign Agent'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignAgentModal;
