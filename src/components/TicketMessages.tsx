import { useState, useEffect, useCallback } from 'react';
import { Form, Button, ListGroup, Alert } from 'react-bootstrap';
import { TicketMessage, User } from '@prisma/client';

type TicketMessageWithUser = TicketMessage & { user: User };

type TicketMessagesProps = {
  ticketId: string;
};

const TicketMessages = ({ ticketId }: TicketMessagesProps) => {
  const [messages, setMessages] = useState<TicketMessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchMessages();
    }
  }, [ticketId, fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!res.ok) {
        throw new Error('Failed to post message');
      }

      const data = await res.json();
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      <ListGroup className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {messages.map((message) => (
          <ListGroup.Item key={message.id}>
            <strong>{message.user.name || message.user.email}</strong> <small className="text-muted">({new Date(message.createdAt).toLocaleString()})</small>
            <p>{message.content}</p>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrire un message..."
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer'}
        </Button>
      </Form>
    </div>
  );
};

export default TicketMessages;
