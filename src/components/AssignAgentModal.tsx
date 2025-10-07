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
  leadId: string | null; // Optional for bulk assign
  currentAssignedAgentId: string | null; // Optional for bulk assign
  selectedLeadIds?: string[]; // New prop for bulk assign
  onAgentAssigned: (updatedLead?: any) => void; // updatedLead is optional for bulk
}

const AssignAgentModal: React.FC<AssignAgentModalProps> = ({
  show,
  onClose,
  leadId,
  currentAssignedAgentId,
  selectedLeadIds, // Destructure new prop
  onAgentAssigned,
}) => {
  const isBulkAssign = selectedLeadIds && selectedLeadIds.length > 0;
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
    if (!selectedAgentId) {
      setError('Please select an agent.');
      return;
    }

    setAssigning(true);
    setError(null);
    try {
      if (isBulkAssign) {
        const response = await axios.patch('/api/leads/bulk-update', {
          leadIds: selectedLeadIds,
          assignedToId: selectedAgentId,
        });
        console.log('Bulk assign successful:', response.data);
        onAgentAssigned(); // No specific lead data returned for bulk
      } else if (leadId) {
        const response = await axios.patch(`/api/leads/${leadId}/update`, {
          assignedToId: selectedAgentId,
        });
        console.log('Single assign successful:', response.data);
        onAgentAssigned(response.data);
      } else {
        setError('No lead(s) selected for assignment.');
        setAssigning(false);
        return;
      }
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
        <Modal.Title>{isBulkAssign ? 'Assigner des agents (en masse)' : 'Assigner un agent au prospect'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isBulkAssign && <p>{selectedLeadIds?.length} prospect(s) sélectionné(s) seront assignés.</p>}
        {loadingAgents ? (
          <p>Loading agents...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <Form.Group controlId="agentSelect">
            <Form.Label>Sélectionner un agent</Form.Label>
            <Form.Control
              as="select"
              value={selectedAgentId || ''}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">-- Sélectionner un agent --</option>
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
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleAssignAgent}
          disabled={!selectedAgentId || assigning || loadingAgents}
        >
          {assigning ? 'Assignation...' : 'Assigner l\'agent'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignAgentModal;
